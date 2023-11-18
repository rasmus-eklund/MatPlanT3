import days from "~/constants/days";
import units from "~/constants/units";
import svgPaths from "~/icons/svgPaths";
import { RouterOutputs } from "~/trpc/shared";
import { meilisearchGetIngs } from "prisma/seed";
export type CategoryItem = {
  name: string;
  id: string;
  subcategories: { name: string; id: string }[];
};

export type Day = (typeof days)[number];
export type Unit = (typeof units)[number];
export type tIcon = keyof typeof svgPaths;

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
  portions: number;
  userId: string;
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
