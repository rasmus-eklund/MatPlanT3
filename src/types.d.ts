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
    id: string;
    ingredientId: string;
    quantity: number;
    groupId: string | null;
    recipeId: string;
    unit: Unit;
    order: number;
    name: string;
  }[];
  contained: { id: string; recipeId: string; quantity: number }[];
};

type UpdateRecipe = {
  recipe: {
    id: string;
    name: string;
    quantity: number;
    unit: Unit;
    isPublic: boolean;
    instruction: string;
  };
  editIngredients: {
    id: string;
    unit: Unit;
    quantity: number;
    groupId: string | null;
    ingredientId: string;
    order: number;
  }[];
  removeIngredients: string[];
  addIngredients: CreateRecipeInput["ingredients"];
  editContained: { quantity: number; id: string }[];
  removeContained: string[];
  addContained: CreateRecipeInput["contained"];
};
