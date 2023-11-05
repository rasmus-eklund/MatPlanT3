import days from "~/app/constants/days";
import units from "~/app/constants/units";
import svgPaths from "~/app/_components/icons/svgPaths";
import { RouterOutputs } from "~/trpc/shared";
export type CategoryItem = {
  name: string;
  id: number;
  subcategories: { name: string; id: number }[];
};

export type Day = (typeof days)[number];
export type Unit = (typeof units)[number];
export type tIcon = keyof typeof svgPaths;

export type SearchIngredient = {
  ingredientId: string;
  name: string;
  category: string;
  subcategory: string;
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
