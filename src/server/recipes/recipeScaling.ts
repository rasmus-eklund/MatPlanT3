import "server-only";

import { authorize, type User } from "~/server/auth";
import { getRecipeByIdForUser } from "~/server/api/recipes";
import { errorMessages } from "~/server/errors";
import type { Recipe } from "~/server/shared";
import type { Unit } from "~/types";

export type MenuItemSnapshot = {
  id: string;
  recipeId: string;
  quantity: number;
};

export type ExpectedMenuItem = {
  recipeIngredientId: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
};

export const getRescaledRecipes = async (
  id: string,
  quantity: number,
  visited: string[],
  user: User,
) => {
  if (visited.includes(id)) {
    throw new Error(errorMessages.CIRCULARREF);
  }
  const acc: Recipe[] = [];
  const recipe = await getRecipeByIdForUser({ id, user });
  const scale = quantity / recipe.quantity;
  const rescaled = rescaleRecipe(recipe, scale);
  for (const child of rescaled.contained) {
    const childRecipes = await getRescaledRecipes(
      child.recipeId,
      child.quantity,
      [...visited, id],
      user,
    );
    acc.push(...childRecipes);
  }
  return [rescaled, ...acc];
};

export const getRescaledRecipesForCurrentUser = async (
  id: string,
  quantity: number,
  visited: string[] = [],
) => {
  const user = await authorize();
  return getRescaledRecipes(id, quantity, visited, user);
};

export const getExpectedMenuItems = async (
  menuItem: MenuItemSnapshot,
  user: User,
): Promise<ExpectedMenuItem[]> => {
  const recipes = await getRescaledRecipes(
    menuItem.recipeId,
    menuItem.quantity,
    [],
    user,
  );

  return recipes.flatMap((recipe) =>
    recipe.groups.flatMap((group) =>
      group.ingredients.map(({ ingredientId, quantity, unit, id }) => ({
        recipeIngredientId: id,
        ingredientId,
        quantity,
        unit,
      })),
    ),
  );
};

export const scaleGroups = <T extends { ingredients: { quantity: number }[] }>(
  groups: T[],
  scale: number,
): T[] => {
  return groups.map((group) => ({
    ...group,
    ingredients: group.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity * scale,
    })),
  }));
};

export const scaleIngredients = <T extends { quantity: number }>(
  ingredients: T[],
  scale: number,
): T[] => {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: ingredient.quantity * scale,
  }));
};

export const rescaleRecipe = (recipe: Recipe, scale: number): Recipe => {
  const contained = recipe.contained.map((i) => ({
    ...i,
    quantity: i.quantity * scale,
  }));
  const groups = scaleGroups(recipe.groups, scale);
  const quantity = recipe.quantity * scale;
  return { ...recipe, groups, quantity, contained };
};
