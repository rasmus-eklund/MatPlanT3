import { tFullRecipe, tIngredient } from "~/zod/zodSchemas";
import { getRecipeById } from "./getById";
import scaleIngredients from "./scaleIngredients";

export const getAllContained = async (
  recipe: tFullRecipe,
): Promise<(tIngredient & { recipeId: string })[]> => {
  const acc: (tIngredient & { recipeId: string })[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe = await getRecipeById(containedRecipe.containedRecipeId);
    const scale = containedRecipe.portions / childRecipe.recipe.portions;
    const rescaled = scaleIngredients(childRecipe.ingredients, scale);
    const withRecipe = rescaled.map(({ order, ...i }) => ({
      ...i,
      recipeId: childRecipe.recipe.id,
    }));
    acc.push(...withRecipe, ...(await getAllContained(childRecipe)));
  }
  return acc;
};

export const getAllContainedRecipes = async (
  recipe: tFullRecipe,
): Promise<tFullRecipe[]> => {
  const acc: tFullRecipe[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe: tFullRecipe = await getRecipeById(
      containedRecipe.containedRecipeId,
    );
    acc.push(childRecipe, ...(await getAllContainedRecipes(childRecipe)));
  }
  return acc;
};
