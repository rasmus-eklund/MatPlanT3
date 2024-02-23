import { MeilRecipe } from "types";
import msClient from "./meilisearchClient";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const add = async (recipe: MeilRecipe) => {
  await msClient.index("recipes").addDocuments([recipe]);
};

export const update = async (recipe: MeilRecipe) => {
  await msClient.index("recipes").updateDocuments([recipe]);
};

export const remove = async (id: string) => {
  await msClient.index("recipes").deleteDocument(id);
};

export const removeMultiple = async (ids: string[]) => {
  await msClient.index("recipes").deleteDocuments(ids);
};

const applySettings = async () => {
  await await msClient
    .index("recipes")
    .updateSearchableAttributes(["name", "ingredients", "isPublic", "userId"]);
  await msClient
    .index("recipes")
    .updateFilterableAttributes(["isPublic", "userId"]);
  await msClient.index("recipes").updateSortableAttributes(["name"]);
};

export const updateAllRecipes = async (recipes: MeilRecipe[]) => {
  await msClient.index("recipes").deleteAllDocuments();
  await msClient.index("recipes").addDocuments(recipes);
  await applySettings();
};

export const seedMeilisearchRecipes = async (recipes: MeilRecipe[]) => {
  try {
    await msClient.deleteIndexIfExists("recipes");
    await msClient.createIndex("recipes", { primaryKey: "id" });
    await msClient.index("recipes").addDocuments(recipes);
    await applySettings();
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
  ).map(({ id, ingredients, name, userId, isPublic }) => ({
    id,
    name,
    ingredients: ingredients.map(({ ingredient: { name } }) => name),
    userId,
    isPublic,
  }));
  return recipes;
};
