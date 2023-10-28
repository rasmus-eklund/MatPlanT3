import { readFileSync } from "fs";

type Ingredient = {
  name: string;
  category: string;
  categoryId: number;
  subcategory: string;
  subcategoryId: number;
};
const ingredients = JSON.parse(
  readFileSync("ingredients.json").toString(),
) as Ingredient[];

export default ingredients;
