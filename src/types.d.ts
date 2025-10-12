import type { Item, Recipe } from "~/server/shared";
import type { unitsAbbr } from "~/lib/constants/units";
import type { User } from "~/server/auth";

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
  quantity: number;
  unit: Unit;
};

export type ItemsGrouped = {
  name: string;
  subcategoryId: number;
  checked: boolean;
  group: Item[];
  home: boolean;
  ingredientId: string;
};

export type SearchRecipeParams = {
  page: number;
  search: string;
  shared: boolean;
};

export type RecipeFormSubmit = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  instruction: string;
  isPublic: boolean;
  groups: Recipe["groups"];
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
  ingredients: {
    edited: {
      id: string;
      quantity: number;
      unit: Unit;
      order: number;
      groupId: string;
      ingredientId: string;
    }[];
    removed: string[];
    added: {
      id: string;
      quantity: number;
      unit: Unit;
      order: number;
      groupId: string;
      ingredientId: string;
    }[];
  };
  contained: {
    edited: { id: string; recipeId: string; quantity: number }[];
    removed: string[];
    added: { id: string; recipeId: string; quantity: number }[];
  };
  groups: {
    edited: { id: string; name: string; order: number }[];
    removed: string[];
    added: { id: string; name: string; order: number }[];
  };
};

export type ExternalRecipe = {
  recipeId: string;
  quantity: number;
  unit: Unit;
  name: string;
  groupId: string;
  ingredients: {
    id: string;
    input: string;
    match: Recipe["groups"][number]["ingredients"][number];
  }[];
  instruction: string;
};

export type QueueItem = {
  id: string;
  checked: boolean;
  user: User;
};

export type SearchItemParams = { store?: string; menuId?: string } | undefined;
