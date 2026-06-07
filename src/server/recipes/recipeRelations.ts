import "server-only";

import { inArray, sql } from "drizzle-orm";
import type { db } from "~/server/db";
import { recipe_recipe } from "~/server/db/schema";

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
