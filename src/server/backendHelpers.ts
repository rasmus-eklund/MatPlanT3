"use server";

import type { Unit } from "~/types";
import type { Recipe } from "~/server/shared";
import type { User } from "~/server/auth";
import { errorMessages } from "~/server/errors";
import { getParentRecipe, getRecipeById } from "~/server/api/recipes";

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
  const recipe = await getRecipeById({ id, user });
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

export const getParentRecipes = async (recipeId: string): Promise<string[]> => {
  const parents = await getParentRecipe(recipeId);

  if (!parents.length) return [];

  const parentIds = parents.map((p) => p.containerId);
  const ancestorIds = await Promise.all(parentIds.map(getParentRecipes));

  return [...new Set([...parentIds, ...ancestorIds.flat()])];
};

export const groupItemsByRecipeIngredient = <
  T extends { recipeIngredientId: string },
>(
  rows: T[],
) => {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const list = grouped.get(row.recipeIngredientId) ?? [];
    list.push(row);
    grouped.set(row.recipeIngredientId, list);
  }
  return grouped;
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

export const createCopy = (recipeId: string, recipe: Recipe) => {
  const { instruction, name, quantity, unit, groups } = recipe;
  const newIngredients: Recipe["groups"][number]["ingredients"] = [];
  const newGroups = groups.map(({ name, order, ingredients }) => {
    const groupId = crypto.randomUUID();
    for (const ingredient of ingredients) {
      newIngredients.push({
        ...ingredient,
        groupId,
        id: crypto.randomUUID(),
      });
    }
    return {
      id: groupId,
      name,
      order,
      recipeId,
    };
  });

  return {
    newRecipe: { name, quantity, unit, instruction, id: recipeId },
    newIngredients,
    newGroups,
  };
};
