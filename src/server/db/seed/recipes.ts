import data from "backup/recipes.json";
import { randomUUID } from "crypto";
import type { Unit, CreateRecipeInput, MeilRecipe } from "~/types";
import { db } from "..";
import { add } from "~/server/meilisearch/seedRecipes";
import { recipe, recipe_ingredient, recipe_recipe } from "../schema";

export const addRecipesFromBackup = async (userId: string) => {
  const ings = await db.query.ingredient.findMany();
  for (const recipe of data) {
    const id = "placeholder";
    const ingredients: CreateRecipeInput["ingredients"] =
      recipe.ingredients.map((i, order) => ({
        id: randomUUID() as string,
        ingredientId: ings.find((ing) => ing.name === i.name)!.id,
        order,
        name: i.name,
        quantity: i.quantity,
        recipeId: id,
        unit: i.unit as Unit,
        groupId: null,
      }));
    await createRecipe({
      userId,
      id,
      contained: [],
      ingredients,
      instruction: recipe.instruction,
      isPublic: false,
      name: recipe.name,
      quantity: recipe.quantity,
      unit: recipe.unit as Unit,
    });
  }
};

export const createRecipe = async ({
  userId,
  name,
  quantity,
  unit,
  instruction,
  isPublic,
  ingredients,
  contained,
}: CreateRecipeInput & { userId: string }) => {
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(recipe).values({
      id,
      name,
      quantity,
      unit,
      instruction,
      isPublic,
      userId,
    });
    if (!!ingredients.length) {
      await tx
        .insert(recipe_ingredient)
        .values(ingredients.map((ing) => ({ ...ing, recipeId: id })));
    }
    if (!!contained.length) {
      await tx
        .insert(recipe_recipe)
        .values(contained.map((i) => ({ ...i, containerId: id })));
    }
  });

  const meilRecipe: MeilRecipe = {
    id,
    ingredients: ingredients.map(({ name }) => name),
    isPublic,
    name,
    userId,
  };
  await add(meilRecipe);
};
