import { MeilIngredient } from "types";
import msClient from "./meilisearchClient";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const seedMeilisearchIngredients = async (ings: MeilIngredient[]) => {
  try {
    await msClient.deleteIndexIfExists("ingredients");
    const res = await msClient.index("ingredients").addDocuments(ings);
    console.log('Seeded meilisearch ingredients index');
  } catch (error) {
    console.log(error);
  }
};

export const meilisearchGetIngs = async (
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  const ings = (
    await db.ingredient.findMany({
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
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
