// /* eslint-disable drizzle/enforce-delete-with-where */

import { writeFileSync } from "fs";
import { db } from "..";

// import recipes from "backup/recipes.json";
// import ingredients from "backup/ingredients.json";
// import { randomUUID } from "crypto";
// import type { Unit, CreateRecipeInput, MeilRecipe } from "~/types";
// import { add } from "~/server/meilisearch/seedRecipes";
import {
  ingredient,
  // recipe,
  // recipe_ingredient,
  // recipe_recipe,
} from "../schema";
import { not, eq } from "drizzle-orm";
// import ingredients from "backup/ingredients.json";

// export const addRecipesFromBackup = async (userId: string) => {
//   const ings = await db.query.ingredient.findMany();
//   for (const recipe of recipes) {
//     const id = "placeholder";
//     const ingredients: CreateRecipeInput["ingredients"] =
//       recipe.ingredients.map((i, order) => ({
//         id: randomUUID() as string,
//         ingredientId: ings.find((ing) => ing.name === i.name)!.id,
//         order,
//         name: i.name,
//         quantity: i.quantity,
//         recipeId: id,
//         unit: i.unit as Unit,
//         groupId: null,
//       }));
//     await createRecipe({
//       userId,
//       id,
//       contained: [],
//       ingredients,
//       instruction: recipe.instruction,
//       isPublic: false,
//       name: recipe.name,
//       quantity: recipe.quantity,
//       unit: recipe.unit as Unit,
//     });
//   }
// };

// export const createRecipe = async ({
//   userId,
//   name,
//   quantity,
//   unit,
//   instruction,
//   isPublic,
//   ingredients,
//   contained,
// }: CreateRecipeInput & { userId: string }) => {
//   const id = randomUUID();
//   await db.transaction(async (tx) => {
//     await tx.insert(recipe).values({
//       id,
//       name,
//       quantity,
//       unit,
//       instruction,
//       isPublic,
//       userId,
//     });
//     if (!!ingredients.length) {
//       await tx
//         .insert(recipe_ingredient)
//         .values(ingredients.map((ing) => ({ ...ing, recipeId: id })));
//     }
//     if (!!contained.length) {
//       await tx
//         .insert(recipe_recipe)
//         .values(contained.map((i) => ({ ...i, containerId: id })));
//     }
//   });

//   const meilRecipe: MeilRecipe = {
//     id,
//     ingredients: ingredients.map(({ name }) => name),
//     isPublic,
//     name,
//     userId,
//   };
//   await add(meilRecipe);
// };

// export const seedIngredients = async () => {
//   await db.delete(ingredient).where(not(eq(ingredient.id, 'dummy')));
//   const ings: (typeof ingredient.$inferInsert)[] = [];
//   for (const { name, categoryId, subcategoryId } of ingredients) {
//     ings.push({ name, categoryId, subcategoryId });
//   }
//   await db.insert(ingredient).values(ings);
// };

export const backupIngredients = async () => {
  const ings = await db.query.ingredient.findMany({
    with: { category: true, subcategory: true },
  });
  const ingsJson = ings.map((ing) => ({
    name: ing.name,
    categoryId: ing.categoryId,
    subcategoryId: ing.subcategoryId,
    category: ing.category.name,
    subcategory: ing.subcategory.name,
  }));
  writeFileSync("backup/ingredients.json", JSON.stringify(ingsJson, null, 2));
};

export const backupRecipes = async () => {
  const recipes = await db.query.recipe.findMany({
    with: { ingredients: { with: { group: true, ingredient: true } }, contained: true },
  });
  const recipesJson = recipes.map((recipe) => ({
    name: recipe.name,
    quantity: recipe.quantity,
    unit: recipe.unit,
    instruction: recipe.instruction,
    isPublic: recipe.isPublic,
    ingredients: recipe.ingredients.map((ing) => ({
      name: ing.ingredient.name,
      quantity: ing.quantity,
      unit: ing.unit,
      group: ing.group?.name,
      groupOrder: ing.group?.order
    })),
    
  }));
  writeFileSync("backup/recipes.json", JSON.stringify(recipesJson, null, 2));
};
