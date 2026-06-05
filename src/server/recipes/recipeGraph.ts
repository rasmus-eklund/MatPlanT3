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
  context: { user },
  direction,
  recipeId,
}: {
  context: { user?: User };
  direction: RecipeGraphDirection;
  recipeId: string;
}): Promise<string[]> => {
  const linkedColumn =
    direction === "children"
      ? recipe_recipe.recipeId
      : recipe_recipe.containerId;
  const sourceColumn =
    direction === "children"
      ? recipe_recipe.containerId
      : recipe_recipe.recipeId;

  if (!user) {
    const rows = await db
      .select({ id: linkedColumn })
      .from(recipe_recipe)
      .where(eq(sourceColumn, recipeId));
    return rows.map((row) => row.id);
  }

  const rows = await db
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
}: {
  direction: RecipeGraphDirection;
  recipeId: string;
  user?: User;
}): Promise<string[]> =>
  await recipeGraph.getLinkedRecipeDescendants({
    context: { user },
    direction,
    recipeId,
  });

export const getParentRecipes = async (recipeId: string): Promise<string[]> =>
  await getLinkedRecipeDescendants({ direction: "parents", recipeId });

export const recipeContainsRecipe = async ({
  sourceId,
  targetId,
  user,
}: {
  sourceId: string;
  targetId: string;
  user: User;
}): Promise<boolean> => {
  return await recipeGraph.recipeContainsRecipe({
    context: { user },
    sourceId,
    targetId,
  });
};
