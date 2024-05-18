"use server";
import msClient from "./meilisearchClient";
import { db } from "../db";

export const seedMeilisearchIngredients = async () => {
  try {
    const ingredients = await getIngredients();
    await msClient.deleteIndexIfExists("ingredients");
    await msClient.createIndex("ingredients", { primaryKey: "ingredientId" });
    await msClient.index("ingredients").addDocuments(ingredients);
    await applySettings();
    console.log("Seeded meilisearch ingredients index");
  } catch (error) {
    console.log(error);
  }
};

const applySettings = async () => {
  await msClient
    .index("ingredients")
    .updateSearchableAttributes(["name", "category", "subcategory"]);
};

export const updateAllIngredients = async () => {
  const ingredients = await getIngredients();
  await msClient.index("ingredients").deleteAllDocuments();
  await msClient.index("ingredients").addDocuments(ingredients);
  await applySettings();
};

export const getIngredients = async () => {
  const ings = (
    await db.query.ingredient.findMany({
      with: {
        category: { columns: { name: true } },
        subcategory: { columns: { name: true } },
      },
    })
  ).map((i) => ({
    ingredientId: i.id,
    name: i.name,
    category: i.category.name,
    subcategory: i.subcategory.name,
  }));
  return ings;
};
