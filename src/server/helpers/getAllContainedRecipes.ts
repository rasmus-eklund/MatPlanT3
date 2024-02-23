import { tFullRecipe, tIngredient } from "~/zod/zodSchemas";
import { getRecipeById } from "./getById";
import scaleIngredients from "./scaleIngredients";

export const getAllContained = async (
  recipe: tFullRecipe,
  visited: string[],
): Promise<(tIngredient & { recipeId: string })[]> => {
  const acc: (tIngredient & { recipeId: string })[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe = await getRecipeById(containedRecipe.containedRecipeId);
    const scale = containedRecipe.quantity / childRecipe.recipe.quantity;
    const rescaled = scaleIngredients(childRecipe.ingredients, scale);
    const withRecipe = rescaled.map(({ order, group, ...i }) => ({
      ...i,
      recipeId: childRecipe.recipe.id,
    }));
    if (visited.includes(containedRecipe.containedRecipeId)) {
      throw new Error("circular");
    }
    acc.push(
      ...withRecipe,
      ...(await getAllContained(childRecipe, [
        ...visited,
        containedRecipe.containedRecipeId,
      ])),
    );
  }
  return acc;
};

export const getAllContainedRecipes = async (
  recipe: tFullRecipe,
  visited: string[],
): Promise<tFullRecipe[]> => {
  const acc: tFullRecipe[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe: tFullRecipe = await getRecipeById(
      containedRecipe.containedRecipeId,
    );
    if (visited.includes(containedRecipe.containedRecipeId)) {
      throw new Error("circular");
    }
    acc.push(
      childRecipe,
      ...(await getAllContainedRecipes(childRecipe, [
        ...visited,
        containedRecipe.containedRecipeId,
      ])),
    );
  }
  return acc;
};

export const getAllContainedRecipesRescaled = async (
  recipe: tFullRecipe,
  visited: string[],
): Promise<tFullRecipe[]> => {
  const acc: tFullRecipe[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe = await getRecipeById(containedRecipe.containedRecipeId);
    const scale = containedRecipe.quantity / childRecipe.recipe.quantity;
    childRecipe.ingredients = scaleIngredients(childRecipe.ingredients, scale);
    childRecipe.recipe.quantity *= scale;
    if (visited.includes(containedRecipe.containedRecipeId)) {
      throw new Error("circular");
    }
    acc.push(
      childRecipe,
      ...(await getAllContainedRecipesRescaled(childRecipe, [
        ...visited,
        containedRecipe.containedRecipeId,
      ])),
    );
  }
  return acc;
};
