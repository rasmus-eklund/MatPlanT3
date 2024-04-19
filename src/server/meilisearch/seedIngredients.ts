import msClient from "./meilisearchClient";
import { db } from "../db";

export const seedMeilisearchIngredients = async () => {
  try {
    const ingredients = await getIngredients();
    await msClient.deleteIndexIfExists("ingredients");
    await msClient.index("ingredients").addDocuments(ingredients);
    console.log("Seeded meilisearch ingredients index");
  } catch (error) {
    console.log(error);
  }
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
