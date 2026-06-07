import "server-only";

import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { User } from "~/server/auth";
import { db } from "~/server/db";
import { items, menu } from "~/server/db/schema";
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

const bulkUpdateRecipeBackedItems = async (
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
