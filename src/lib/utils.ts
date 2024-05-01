import type { Dispatch, SetStateAction } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Recipe } from "~/server/shared";
import { getRecipeById } from "~/server/api/recipes";
import { errorMessages } from "~/server/errors";
import { type SearchRecipeParams } from "~/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatUrl = ({ search, shared, page }: SearchRecipeParams) => {
  return `/recipes?search=${search}&page=${page}&shared=${shared ? "true" : "false"}`;
};

export const capitalize = (s: string) =>
  s
    .split("")
    .map((l, i) => (i === 0 ? l.toUpperCase() : l))
    .join("");

export const slugify = (str: string) => {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
};

export const delay = async (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const crudFactory = <T extends { id: string }>(
  fn: Dispatch<SetStateAction<T[]>>,
) => {
  const add = (item: T) => {
    fn((p) => [...p, item]);
  };
  const remove = ({ id }: { id: string }) => {
    fn((p) => p.filter((i) => i.id !== id));
  };
  const update = (item: T) => {
    fn((p) => {
      const index = p.findIndex((i) => i.id === item.id);
      const newItems = [...p];
      if (index !== -1) {
        newItems[index] = item;
      }
      return newItems;
    });
  };
  return { add, remove, update };
};

export const getAllContained = async (
  recipe: Recipe,
  visited: string[],
): Promise<Recipe["ingredients"]> => {
  const acc: Recipe["ingredients"] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe = await getRecipeById(containedRecipe.recipeId);
    const scale = containedRecipe.quantity / childRecipe.quantity;
    const rescaled = scaleIngredients(childRecipe.ingredients, scale);
    const withRecipe = rescaled.map((i) => ({
      ...i,
      recipeId: childRecipe.id,
    }));
    if (visited.includes(containedRecipe.recipeId)) {
      throw new Error(errorMessages.CIRCULARREF);
    }
    acc.push(
      ...withRecipe,
      ...(await getAllContained(childRecipe, [
        ...visited,
        containedRecipe.recipeId,
      ])),
    );
  }
  return acc;
};

export const getAllContainedRecipes = async (
  recipe: Recipe,
  visited: string[],
): Promise<Recipe[]> => {
  const acc: Recipe[] = [];
  for (const containedRecipe of recipe.contained) {
    const childRecipe: Recipe = await getRecipeById(containedRecipe.recipeId);
    if (visited.includes(containedRecipe.recipeId)) {
      throw new Error(errorMessages.CIRCULARREF);
    }
    acc.push(
      childRecipe,
      ...(await getAllContainedRecipes(childRecipe, [
        ...visited,
        containedRecipe.recipeId,
      ])),
    );
  }
  return acc;
};

export const getAllContainedRecipesRescaled = async (
  recipe: Recipe,
  visited: string[],
  scale: number,
): Promise<Recipe[]> => {
  const acc: Recipe[] = [];
  for (const containedRecipe of recipe.contained) {
    if (visited.includes(containedRecipe.recipeId)) {
      throw new Error(errorMessages.CIRCULARREF);
    }
    const childRecipe = await getRecipeById(containedRecipe.recipeId);
    const rescaled = rescaleRecipe(childRecipe, scale);
    acc.push(
      rescaled,
      ...(await getAllContainedRecipesRescaled(
        rescaled,
        [...visited, containedRecipe.recipeId],
        scale,
      )),
    );
  }
  return acc;
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
  const ingredients = scaleIngredients(recipe.ingredients, scale);
  const quantity = recipe.quantity * scale;
  return { ...recipe, ingredients, quantity, contained };
};

export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(
    `This value was thrown as is, not through an Error: ${stringified}`,
  );
  return error;
};

export const dateToString = (date: Date) =>
  date.toLocaleDateString("sv-SE", {
    dateStyle: "short",
  });

export const formatDate = (date: Date): string => {
  const weekdays = [
    "Söndag",
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
  ];
  const weekday = weekdays[date.getDay()];
  return `${weekday}, ${date.getDate()}/${date.getMonth() + 1}`;
};

export const create_copy = (recipeId: string, recipe: Recipe) => {
  const { ingredients, instruction, name, quantity, unit } = recipe;
  const newIngredients = ingredients.map(({ id: _, ...i }) => ({
    ...i,
    recipeId,
  }));
  return {
    newRecipe: { name, quantity, unit, instruction, id: recipeId },
    newIngredients,
  };
};
