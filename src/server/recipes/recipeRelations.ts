import "server-only";

import { inArray, sql } from "drizzle-orm";
import type { db } from "~/server/db";
import { recipe_ingredient, recipe_recipe } from "~/server/db/schema";
import type { Unit } from "~/types";

export type RecipeIngredientEdit = {
  id: string;
  groupId: string;
  ingredientId: string;
  order: number;
  quantity: number;
  unit: Unit;
};

export const bulkUpdateRecipeIngredients = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  updates: RecipeIngredientEdit[],
) => {
  if (!updates.length) {
    return;
  }

  const ids = updates.map((update) => update.id);
  const groupCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.groupId}`),
    sql` `,
  );
  const ingredientCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.ingredientId}`),
    sql` `,
  );
  const orderCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.order}`),
    sql` `,
  );
  const quantityCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.quantity}`),
    sql` `,
  );
  const unitCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.unit}`),
    sql` `,
  );

  await tx
    .update(recipe_ingredient)
    .set({
      groupId: sql`case ${recipe_ingredient.id} ${groupCases} else ${recipe_ingredient.groupId} end`,
      ingredientId: sql`case ${recipe_ingredient.id} ${ingredientCases} else ${recipe_ingredient.ingredientId} end`,
      order: sql`case ${recipe_ingredient.id} ${orderCases} else ${recipe_ingredient.order} end`,
      quantity: sql`case ${recipe_ingredient.id} ${quantityCases} else ${recipe_ingredient.quantity} end`,
      unit: sql`case ${recipe_ingredient.id} ${unitCases} else ${recipe_ingredient.unit} end`,
    })
    .where(inArray(recipe_ingredient.id, ids));
};

export const bulkUpdateContainedRecipeQuantities = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  updates: Array<{ id: string; quantity: number }>,
) => {
  if (!updates.length) {
    return;
  }

  const quantityCases = sql.join(
    updates.map((update) => sql`when ${update.id} then ${update.quantity}`),
    sql` `,
  );
  const updateIds = updates.map((update) => update.id);

  await tx
    .update(recipe_recipe)
    .set({
      quantity: sql`case ${recipe_recipe.id} ${quantityCases} else ${recipe_recipe.quantity} end`,
    })
    .where(inArray(recipe_recipe.id, updateIds));
};
