import { tFullRecipe, tIngredient } from "~/zod/zodSchemas";
import { getRecipeById } from "./getById";
import scaleIngredients from "./scaleIngredients";

export const getAllContained = async (
  recipe: tFullRecipe,
): Promise<tIngredient[]> => {
  const acc: tIngredient[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe = await getRecipeById(containedRecipe.containedRecipeId);
    const scale = containedRecipe.portions / childRecipe.recipe.portions;
    const rescaled = scaleIngredients(childRecipe.ingredients, scale);
    acc.push(...rescaled, ...(await getAllContained(childRecipe)));
  }
  return acc;
};
