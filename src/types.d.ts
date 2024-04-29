import type { Item } from "~/server/shared";
import type { unitsAbbr } from "~/lib/constants/units";

export type Unit = keyof typeof unitsAbbr;
export type MeilIngredient = {
  ingredientId: string;
  name: string;
  category: string;
  subcategory: string;
};

export type MeilRecipe = {
  id: string;
  name: string;
  ingredients: string[];
  userId: string;
  isPublic: boolean;
};

export type ItemsGrouped = {
  name: string;
  subcategoryId: number;
  checked: boolean;
  group: Item[];
  home: boolean;
};

export type SearchRecipeParams = {
  page: number;
  search: string;
  shared: boolean;
};

export type CreateRecipeInput = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  instruction: string;
  isPublic: boolean;
  ingredients: {
    ingredientId: string;
    quantity: number;
    recipeId: string;
    unit: Unit;
    order: number;
  }[];
  contained: { recipeId: string; quantity: number }[];
};
