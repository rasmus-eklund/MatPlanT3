import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import type { db } from "~/server/db";
import {
  items,
  recipe,
  recipe_group,
  recipe_ingredient,
  recipe_recipe,
} from "~/server/db/schema";
import type { Unit, UpdateRecipe } from "~/types";
import {
  bulkUpdateContainedRecipeQuantities,
  bulkUpdateRecipeIngredients,
} from "./recipeRelations";
import {
  bulkUpdateRecipeBackedItems,
  getDirectRecipeSyncMenus,
} from "./menuSync";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Updates basic recipe fields like name, quantity, unit, isPublic, and instruction.
 */
export const updateRecipeBasicInfo = async (
  tx: Transaction,
  {
    recipeId,
    userId,
    name,
    quantity,
    unit,
    isPublic,
    instruction,
  }: {
    recipeId: string;
    userId: string;
    name: string;
    quantity: number;
    unit: Unit;
    isPublic: boolean;
    instruction: string;
  },
) => {
  await tx
    .update(recipe)
    .set({ name, quantity, unit, isPublic, instruction })
    .where(and(eq(recipe.id, recipeId), eq(recipe.userId, userId)));
};

/**
 * Handles adding, editing, and deleting recipe groups.
 */
export const updateRecipeGroups = async (
  tx: Transaction,
  {
    recipeId,
    groups,
  }: {
    recipeId: string;
    groups: UpdateRecipe["groups"];
  },
) => {
  if (groups.added.length > 0) {
    await tx
      .insert(recipe_group)
      .values(groups.added.map((g) => ({ ...g, recipeId })));
  }

  if (groups.edited.length > 0) {
    for (const { name, order, id } of groups.edited) {
      await tx
        .update(recipe_group)
        .set({ name, order })
        .where(eq(recipe_group.id, id));
    }
  }

  if (groups.removed.length > 0) {
    for (const id of groups.removed) {
      await tx.delete(recipe_group).where(eq(recipe_group.id, id));
    }
  }
};

/**
 * Handles updating ingredients, including managing corresponding menu item synchronization.
 */
export const updateRecipeIngredients = async (
  tx: Transaction,
  {
    recipeId,
    userId,
    ingredients,
    originalQuantity,
  }: {
    recipeId: string;
    userId: string;
    ingredients: UpdateRecipe["ingredients"];
    originalQuantity: number | undefined;
  },
) => {
  const currentRecipeGroups = await tx.query.recipe_group.findMany({
    where: eq(recipe_group.recipeId, recipeId),
    columns: { id: true },
  });

  const currentRecipeIngredients = currentRecipeGroups.length
    ? await tx.query.recipe_ingredient.findMany({
        where: inArray(
          recipe_ingredient.groupId,
          currentRecipeGroups.map((group) => group.id),
        ),
        columns: {
          id: true,
          quantity: true,
          unit: true,
          ingredientId: true,
        },
      })
    : [];

  const currentRecipeIngredientById = new Map(
    currentRecipeIngredients.map((ingredientRow) => [
      ingredientRow.id,
      ingredientRow,
    ]),
  );

  const itemChangingEditedIngredients = ingredients.edited.filter(
    ({ id, quantity, unit, ingredientId }) => {
      const existing = currentRecipeIngredientById.get(id);
      if (!existing) {
        return true;
      }
      return (
        existing.quantity !== quantity ||
        existing.unit !== unit ||
        existing.ingredientId !== ingredientId
      );
    },
  );

  const needsMenuSync =
    itemChangingEditedIngredients.length > 0 || ingredients.added.length > 0;

  const directSyncMenus =
    needsMenuSync && originalQuantity !== undefined
      ? await getDirectRecipeSyncMenus({
          tx,
          recipeId,
          recipeQuantity: originalQuantity,
          userId,
        })
      : [];

  if (ingredients.edited.length > 0) {
    await bulkUpdateRecipeIngredients(tx, ingredients.edited);

    if (
      itemChangingEditedIngredients.length > 0 &&
      directSyncMenus.length > 0
    ) {
      const editedIds = itemChangingEditedIngredients.map(({ id }) => id);
      const editedById = new Map(
        itemChangingEditedIngredients.map((ingredient) => [
          ingredient.id,
          ingredient,
        ]),
      );
      const editedItemRows = await tx.query.items.findMany({
        where: and(
          eq(items.userId, userId),
          inArray(
            items.menuId,
            directSyncMenus.map((menuRow) => menuRow.id),
          ),
          inArray(items.recipeIngredientId, editedIds),
        ),
        columns: {
          id: true,
          menuId: true,
          recipeIngredientId: true,
          quantity: true,
        },
      });

      await bulkUpdateRecipeBackedItems(
        tx,
        editedItemRows.map((itemRow) => {
          const editedIngredient = editedById.get(itemRow.recipeIngredientId!);
          if (!editedIngredient) {
            throw new Error("Missing direct sync data for recipe item");
          }
          const existingIngredient = currentRecipeIngredientById.get(
            itemRow.recipeIngredientId!,
          );
          if (!existingIngredient) {
            throw new Error("Missing direct ingredient reference data");
          }
          return {
            id: itemRow.id,
            quantity:
              itemRow.quantity *
              (editedIngredient.quantity / existingIngredient.quantity),
            unit: editedIngredient.unit,
            ingredientId: editedIngredient.ingredientId,
          };
        }),
      );
    }
  }

  if (ingredients.removed.length > 0) {
    await tx
      .delete(recipe_ingredient)
      .where(inArray(recipe_ingredient.id, ingredients.removed));
    await tx
      .delete(items)
      .where(inArray(items.recipeIngredientId, ingredients.removed));
  }

  if (ingredients.added.length > 0) {
    const newIds = await tx
      .insert(recipe_ingredient)
      .values(ingredients.added)
      .returning({ id: recipe_ingredient.id });

    if (directSyncMenus.length > 0) {
      await tx.insert(items).values(
        directSyncMenus.flatMap((menuRow) =>
          ingredients.added.map(({ ingredientId, quantity, unit }, index) => ({
            quantity: quantity * menuRow.scale,
            unit,
            userId,
            ingredientId,
            menuId: menuRow.id,
            recipeIngredientId: newIds[index]!.id,
          })),
        ),
      );
    }
  }
};

/**
 * Handles updates to contained (nested) recipes.
 */
export const updateContainedRecipes = async (
  tx: Transaction,
  {
    recipeId,
    contained,
  }: {
    recipeId: string;
    contained: UpdateRecipe["contained"];
  },
) => {
  if (contained.edited.length > 0) {
    await bulkUpdateContainedRecipeQuantities(tx, contained.edited);
  }

  if (contained.removed.length > 0) {
    await tx
      .delete(recipe_recipe)
      .where(inArray(recipe_recipe.id, contained.removed));
  }

  if (contained.added.length > 0) {
    await tx
      .insert(recipe_recipe)
      .values(contained.added.map((i) => ({ ...i, containerId: recipeId })));
  }
};

/**
 * Fetches the updated list of ingredients grouped by their recipe groups.
 */
export const fetchUpdatedIngredients = async (
  tx: Transaction,
  recipeId: string,
) => {
  return tx.query.recipe_group.findMany({
    columns: {},
    where: (r, { eq }) => eq(r.recipeId, recipeId),
    with: {
      ingredients: { with: { ingredient: { columns: { name: true } } } },
    },
  });
};
