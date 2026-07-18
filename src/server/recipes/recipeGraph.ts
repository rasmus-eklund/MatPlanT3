import "server-only";

import { and, eq } from "drizzle-orm";
import type { User } from "~/server/auth";
import { db } from "~/server/db";
import { recipe, recipe_recipe } from "~/server/db/schema";
import {
  createRecipeGraphTraversal,
  type RecipeGraphDirection,
} from "./recipeGraphTraversal";

const getLinkedRecipeIds = async ({
  context: { user, tx },
  direction,
  recipeId,
}: {
  context: {
    user?: User;
    tx?: Parameters<Parameters<typeof db.transaction>[0]>[0];
  };
  direction: RecipeGraphDirection;
  recipeId: string;
}): Promise<string[]> => {
  const client = tx ?? db;
  const linkedColumn =
    direction === "children"
      ? recipe_recipe.recipeId
      : recipe_recipe.containerId;
  const sourceColumn =
    direction === "children"
      ? recipe_recipe.containerId
      : recipe_recipe.recipeId;

  if (!user) {
    const rows = await client
      .select({ id: linkedColumn })
      .from(recipe_recipe)
      .where(eq(sourceColumn, recipeId));
    return rows.map((row) => row.id);
  }

  const rows = await client
    .select({ id: linkedColumn })
    .from(recipe_recipe)
    .innerJoin(recipe, eq(linkedColumn, recipe.id))
    .where(and(eq(sourceColumn, recipeId), eq(recipe.userId, user.id)));
  return rows.map((row) => row.id);
};

const recipeGraph = createRecipeGraphTraversal(getLinkedRecipeIds);

export const getLinkedRecipeDescendants = async ({
  direction,
  recipeId,
  user,
  tx,
}: {
  direction: RecipeGraphDirection;
  recipeId: string;
  user?: User;
  tx?: Parameters<Parameters<typeof db.transaction>[0]>[0];
}): Promise<string[]> =>
  recipeGraph.getLinkedRecipeDescendants({
    context: { user, tx },
    direction,
    recipeId,
  });

export const getParentRecipes = async (
  recipeId: string,
  tx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
) => getLinkedRecipeDescendants({ direction: "parents", recipeId, tx });

export const recipeContainsRecipe = async ({
  sourceId,
  targetId,
  user,
}: {
  sourceId: string;
  targetId: string;
  user: User;
}): Promise<boolean> => {
  return recipeGraph.recipeContainsRecipe({
    context: { user },
    sourceId,
    targetId,
  });
};
