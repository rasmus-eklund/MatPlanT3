import { MeilRecipe } from "types";
import msClient from "./meilisearchClient";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const seedMeilisearchRecipes = async (recipes: MeilRecipe[]) => {
  try {
    await msClient.deleteIndexIfExists("recipes");
    const res = await msClient.index("recipes").addDocuments(recipes);
    console.log("Seeded meilisearch recipes index");
  } catch (error) {
    console.log(error);
  }
};

export const meilisearchGetRecipes = async (
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
): Promise<MeilRecipe[]> => {
  const recipes = (
    await db.recipe.findMany({
      include: {
        ingredients: { select: { name: true } },
      },
    })
  ).map(({ id, ingredients, name, portions, userId }) => ({
    id,
    name,
    ingredients: ingredients.map(({ name }) => name),
    portions,
    userId,
  }));
  return recipes;
};
