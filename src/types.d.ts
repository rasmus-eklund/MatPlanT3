import type { Item } from "~/server/shared";

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
};
