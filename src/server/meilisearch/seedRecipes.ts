import { MeilRecipe } from "types";
import msClient from "./meilisearchClient";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const seedMeilisearchRecipes = async (recipes: MeilRecipe[]) => {
  try {
    await msClient.deleteIndexIfExists("recipes");
    await msClient.index("recipes").addDocuments(recipes);
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
        ingredients: { select: { ingredient: { select: { name: true } } } },
      },
    })
  ).map(({ id, ingredients, name, portions, userId, isPublic }) => ({
    id,
    name,
    ingredients: ingredients.map(({ ingredient: { name } }) => name),
    portions,
    userId,
    isPublic,
  }));
  return recipes;
};
