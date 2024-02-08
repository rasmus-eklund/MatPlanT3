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

export const updateAllRecipes = async (recipes: MeilRecipe[]) => {
  await msClient.index("recipes").deleteAllDocuments();
  await msClient.index("recipes").addDocuments(recipes);
  await msClient
    .index("recipes")
    .updateSearchableAttributes(["name", "ingredients", "isPublic", "userId"]);
  await msClient
    .index("recipes")
    .updateFilterableAttributes(["isPublic", "userId"]);
  await msClient.index("recipes").updateSortableAttributes(["name"]);
};

export const seedMeilisearchRecipes = async (recipes: MeilRecipe[]) => {
  try {
    await msClient.deleteIndexIfExists("recipes");
    await msClient.createIndex("recipes", { primaryKey: "id" });
    await msClient.index("recipes").addDocuments(recipes);
    await msClient
      .index("recipes")
      .updateSearchableAttributes([
        "name",
        "ingredients",
        "isPublic",
        "userId",
      ]);
    await msClient
      .index("recipes")
      .updateFilterableAttributes(["isPublic", "userId"]);
    await msClient.index("recipes").updateSortableAttributes(["name"]);
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
