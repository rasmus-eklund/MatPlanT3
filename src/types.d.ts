import type { Item } from "~/server/shared";
import type { unitsAbbr } from "~/lib/constants/units";
import type { Recipe } from "~/server/shared";

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
  ingredientId: string;
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
  groups: { id: string; name: string; recipeId: string; order: number }[];
  contained: { id: string; recipeId: string; quantity: number }[];
};

export type RecipeFormSubmit = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  instruction: string;
  isPublic: boolean;
  groups: IngredientGroup[];
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
      unit: Unit;
      quantity: number;
      groupId: string | null;
      ingredientId: string;
      order: number;
    }[];
    removed: string[];
    added: CreateRecipeInput["ingredients"];
  };
  contained: {
    edited: Omit<CreateRecipeInput["contained"], "recipeId">;
    removed: string[];
    added: CreateRecipeInput["contained"];
  };
  groups: {
    edited: Omit<CreateRecipeInput["groups"], "recipeId">;
    removed: string[];
    added: CreateRecipeInput["groups"];
  };
};

export type IngredientGroup = {
  id: string;
  name: string;
  order: number;
  ingredients: Recipe["ingredients"];
};

export type RecipeFormUpdateItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  ingredientId: string;
};
