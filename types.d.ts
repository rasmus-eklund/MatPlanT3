import days from "~/constants/days";
import units from "~/constants/units";
import svgPaths from "~/icons/svgPaths";
import { RouterOutputs } from "~/trpc/shared";
import { meilisearchGetIngs } from "prisma/seed";
import externalRecipes from "~/constants/externalRecipes";
export type CategoryItem = {
  name: string;
  id: string;
  subcategories: { name: string; id: string }[];
};

export type Day = (typeof days)[number];
export type Unit = (typeof units)[number];
export type tIcon = keyof typeof svgPaths;
export type externalRecipe = keyof typeof externalRecipes;

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

type StoreOrder = RouterOutputs["store"]["getAll"][number];

export type tItemFilter = {
  group: boolean;
  hideRecipe: boolean;
  selectedStore: StoreOrder;
};

type tItem = RouterOutputs["item"]["getAll"][number];

export type tItemsGrouped = {
  name: string;
  subcategoryId: number;
  checked: boolean;
  group: tItem[];
};

export type UserRole = "USER" | "ADMIN";

export type IngredientFilter = {
  search: string;
  category: number;
  subcategory: number;
  asc: boolean;
};

export type Ingredient = {
  quantity: number;
  unit: Unit;
  name: string;
  id: string;
  order: number;
  group: string | null;
  ingredientId: string;
};
