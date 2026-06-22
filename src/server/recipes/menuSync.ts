import "server-only";

import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { User } from "~/server/auth";
import { db } from "~/server/db";
import { items, menu, recipe, recipe_recipe } from "~/server/db/schema";
import type { Unit } from "~/types";
import { getParentRecipes } from "./recipeGraph";
import { getExpectedMenuItems, type MenuItemSnapshot } from "./recipeScaling";
import { getRecipeBackedItemChanges } from "./recipeMenuItems";

type RecipeBackedItem = {
  id: string;
  quantity: number;
  unit: Unit;
  ingredientId: string;
  recipeIngredientId: string | null;
};

type MenuItemSyncPlan = {
  menuItem: MenuItemSnapshot;
  expectedItems: Awaited<ReturnType<typeof getExpectedMenuItems>>;
};

const getExistingRecipeBackedItems = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  menuId: string,
  userId: string,
): Promise<RecipeBackedItem[]> =>
  tx.query.items.findMany({
    where: and(
      eq(items.menuId, menuId),
      eq(items.userId, userId),
      isNotNull(items.recipeIngredientId),
    ),
    columns: {
      id: true,
      quantity: true,
      unit: true,
      ingredientId: true,
      recipeIngredientId: true,
    },
  });

export const bulkUpdateRecipeBackedItems = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  updates: Array<{
    id: string;
    quantity: number;
    unit: Unit;
    ingredientId: string;
  }>,
) => {
  if (!updates.length) {
    return;
  }

  const quantityCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.quantity}`),
    sql` `,
  );
  const unitCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.unit}`),
    sql` `,
  );
  const ingredientCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.ingredientId}`),
    sql` `,
  );
  const updateIds = updates.map((update) => update.id);

  await tx
    .update(items)
    .set({
      quantity: sql`case ${items.id} ${quantityCases} else ${items.quantity} end`,
      unit: sql`case ${items.id} ${unitCases} else ${items.unit} end`,
      ingredientId: sql`case ${items.id} ${ingredientCases} else ${items.ingredientId} end`,
    })
    .where(inArray(items.id, updateIds));
};

export const getDirectRecipeSyncMenus = async ({
  tx,
  recipeId,
  recipeQuantity,
  userId,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  recipeId: string;
  recipeQuantity: number;
  userId: string;
}) => {
  const parentIds = await getParentRecipes(recipeId);
  const recipeIds = [recipeId, ...parentIds];
  const menus = await tx.query.menu.findMany({
    where: and(eq(menu.userId, userId), inArray(menu.recipeId, recipeIds)),
    columns: { id: true, quantity: true, recipeId: true },
  });

  if (!menus.length) {
    return [];
  }

  const recipeRows = await tx.query.recipe.findMany({
    where: inArray(recipe.id, recipeIds),
    columns: { id: true, quantity: true },
  });
  const relationRows = parentIds.length
    ? await tx.query.recipe_recipe.findMany({
        where: and(
          inArray(recipe_recipe.recipeId, recipeIds),
          inArray(recipe_recipe.containerId, recipeIds),
        ),
        columns: {
          recipeId: true,
          containerId: true,
          quantity: true,
        },
      })
    : [];

  const recipeQuantityById = new Map(
    recipeRows.map((recipeRow) => [recipeRow.id, recipeRow.quantity]),
  );
  recipeQuantityById.set(recipeId, recipeQuantity);

  const parentRelationsByChildId = new Map<
    string,
    Array<{ containerId: string; quantity: number }>
  >();
  for (const relationRow of relationRows) {
    const relations = parentRelationsByChildId.get(relationRow.recipeId) ?? [];
    relations.push({
      containerId: relationRow.containerId,
      quantity: relationRow.quantity,
    });
    parentRelationsByChildId.set(relationRow.recipeId, relations);
  }

  const targetScaleMultiplierByRecipeId = new Map<string, number>([
    [recipeId, 1 / recipeQuantity],
  ]);
  const queue = [recipeId];
  for (const childId of queue) {
    const childMultiplier = targetScaleMultiplierByRecipeId.get(childId)!;
    const parentRelations = parentRelationsByChildId.get(childId) ?? [];

    for (const relation of parentRelations) {
      if (targetScaleMultiplierByRecipeId.has(relation.containerId)) {
        continue;
      }

      const parentQuantity = recipeQuantityById.get(relation.containerId);
      if (!parentQuantity) {
        continue;
      }

      targetScaleMultiplierByRecipeId.set(
        relation.containerId,
        (relation.quantity / parentQuantity) * childMultiplier,
      );
      queue.push(relation.containerId);
    }
  }

  return menus.flatMap((menuRow) => {
    const multiplier = targetScaleMultiplierByRecipeId.get(menuRow.recipeId);
    if (multiplier === undefined) {
      return [];
    }

    return [{ ...menuRow, scale: menuRow.quantity * multiplier }];
  });
};

const syncMenuItems = async ({
  tx,
  plan: { menuItem, expectedItems },
  user,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  plan: MenuItemSyncPlan;
  user: User;
}) => {
  const existingItems = await getExistingRecipeBackedItems(
    tx,
    menuItem.id,
    user.id,
  );
  const existingRecipeBackedItems = existingItems.filter(
    (
      item,
    ): item is RecipeBackedItem & {
      recipeIngredientId: string;
    } => item.recipeIngredientId !== null,
  );
  const { updates, inserts, deleteIds } = getRecipeBackedItemChanges({
    expectedItems,
    existingItems: existingRecipeBackedItems,
  });

  await bulkUpdateRecipeBackedItems(tx, updates);

  if (inserts.length) {
    await tx.insert(items).values(
      inserts.map((item) => ({
        quantity: item.quantity,
        unit: item.unit,
        ingredientId: item.ingredientId,
        recipeIngredientId: item.recipeIngredientId,
        menuId: menuItem.id,
        userId: user.id,
      })),
    );
  }

  if (deleteIds.length) {
    await tx.delete(items).where(inArray(items.id, deleteIds));
  }
};

export const resyncRecipeMenuItems = async ({
  recipeId,
  user,
}: {
  recipeId: string;
  user: User;
}) => {
  const parentIds = await getParentRecipes(recipeId);
  const menus = await db.query.menu.findMany({
    where: and(
      eq(menu.userId, user.id),
      inArray(menu.recipeId, [recipeId, ...parentIds]),
    ),
    columns: { id: true, recipeId: true, quantity: true },
  });

  if (!menus.length) {
    return;
  }

  const syncPlans: MenuItemSyncPlan[] = [];
  for (const menuItem of menus) {
    syncPlans.push({
      menuItem,
      expectedItems: await getExpectedMenuItems(menuItem, user),
    });
  }

  await db.transaction(async (tx) => {
    for (const plan of syncPlans) {
      await syncMenuItems({ tx, plan, user });
    }
  });
};
