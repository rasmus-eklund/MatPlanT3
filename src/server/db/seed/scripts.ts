// /* eslint-disable drizzle/enforce-delete-with-where */

// import { db } from "~/server/db";
// import { ingredient, category, subcategory } from "~/server/db/schema";
// import data from "backup/ingredients.json";
// import categories from "./categories";
// import { type CreateRecipeInput } from "~/types";
// import { createRecipe } from "~/server/api/recipes";

// type Ingredient = {
//   name: string;
//   categoryId: number;
//   subcategoryId: number;
//   category: string;
//   subcategory: string;
// };

// export const seedIngredients = async () => {
//   await db.delete(ingredient);
//   const ings: (typeof ingredient.$inferInsert)[] = [];
//   for (const { name, categoryId, subcategoryId } of data as Ingredient[]) {
//     ings.push({ name, categoryId, subcategoryId });
//   }
//   await db.insert(ingredient).values(ings);
// };

// export const seedCategories = async () => {
//   await db.delete(category);
//   await db.delete(subcategory);
//   const cats = categories.map(({ category: name }, id) => ({ name, id }));
//   await db.insert(category).values(cats);
//   let id = 0;
//   const subcats: (typeof subcategory.$inferInsert)[] = [];
//   for (const { category, subcategories } of categories) {
//     for (const name of subcategories) {
//       subcats.push({
//         categoryId: cats.find(({ name }) => name === category)!.id,
//         name,
//         id,
//       });
//       id++;
//     }
//   }
//   await db.insert(subcategory).values(subcats);
//   console.log("Populated categories and subcategories");
// };

// export const seedRecipes = async (recipes: CreateRecipeInput[]) => {
//   for (const recipe of recipes) {
//     await createRecipe(recipe);
//   }
// };
