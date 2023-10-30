import days from "~/app/constants/days";
import units from "~/app/constants/units";
export type CategoryItem = {
  name: string;
  id: number;
  subcategories: { name: string; id: number }[];
};

export type Day = (typeof days)[number];
export type Unit = (typeof units)[number];

export type SearchIngredient = {
  ingredientId: string;
  name: string;
  category: string;
  subcategory: string;
};
