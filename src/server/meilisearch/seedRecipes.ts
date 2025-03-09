"use server";

import type { MeilRecipe } from "~/types";
import msClient from "./meilisearchClient";
import { db } from "../db";

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
  await msClient
    .index("recipes")
    .updateSearchableAttributes(["name", "ingredients", "isPublic", "userId"]);
  await msClient
    .index("recipes")
    .updateFilterableAttributes(["isPublic", "userId"]);
  await msClient.index("recipes").updateSortableAttributes(["name"]);
};

export const updateAllRecipes = async () => {
  const recipes = await getRecipes();
  await msClient.index("recipes").deleteAllDocuments();
  await msClient.index("recipes").addDocuments(recipes);
  await applySettings();
};

export const seedMeilisearchRecipes = async () => {
  try {
    const recipes = await getRecipes();
    console.log(`Seeding ${recipes.length} recipes...`);
    await msClient.deleteIndexIfExists("recipes");
    await msClient.createIndex("recipes", { primaryKey: "id" });
    await msClient.index("recipes").addDocuments(recipes);
    await applySettings();
  } catch (error) {
    console.log(error);
  }
};

export const getRecipes = async (): Promise<MeilRecipe[]> => {
  const res = await db.query.recipe.findMany({
    columns: { id: true, name: true, isPublic: true, userId: true },
    with: {
      groups: {
        with: {
          ingredients: {
            columns: {},
            with: { ingredient: { columns: { name: true } } },
          },
        },
      },
    },
  });
  return res.map(({ groups, ...rest }) => ({
    ingredients: groups.flatMap((g) =>
      g.ingredients.map((i) => i.ingredient.name),
    ),
    ...rest,
  }));
};
