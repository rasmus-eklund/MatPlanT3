import { db } from "~/server/db";
import categories from "./data/categories";
import msClient from "~/server/meilisearch/meilisearchClient";
import { readFileSync } from "fs";
import { z } from "zod";
import units from "~/app/constants/units";

const zRecipeIngredient = z.object({
  name: z.string().min(1),
  unit: z.enum(units),
  quantity: z.coerce.number().positive(),
});

const zRecipe = z.object({
  name: z.string().min(1),
  portions: z.coerce.number().positive(),
  instruction: z.string(),
  ingredients: z.array(zRecipeIngredient),
});

const zIngredient = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  categoryId: z.coerce.number().positive(),
  subcategory: z.string().min(1),
  subcategoryId: z.coerce.number().positive(),
})

const readIngredients = () => {
  const data = JSON.parse(
    readFileSync("C:/Users/rasmu/Documents/GitHub/MatPlanT3/prisma/data/ingredients.json").toString(),
  );
  const parsedIngredients = z.array(zIngredient).safeParse(data);
  if (!parsedIngredients.success) {
    throw new Error(parsedIngredients.error.message)
  }
  return parsedIngredients.data
}

export default readIngredients;


const populateCategories = async () => {
  const cats = categories.map((cat, id) => ({
    name: cat.category,
    id: id + 1,
  }));
  await db.category.createMany({ data: cats });
  let id = 1;
  const subcats = categories.flatMap((c) =>
    c.subcategories.map((s) => ({
      name: s,
      categoryId: cats.find((i) => i.name === c.category)!.id,
      id: id++,
    })),
  );
  await db.subcategory.createMany({ data: subcats });
  console.log("Populated all categories and subcategories");
};

const populateIngredients = async () => {
  const ingredients = readIngredients();
  console.log(ingredients);
  await db.ingredient.createMany({
    data: ingredients.map(({ categoryId, name, subcategoryId }) => ({
      categoryId,
      name,
      subcategoryId,
    })),
  });
  console.log("Populated ingredients");
};

export const seedMeilisearch = async () => {
  try {
    const ings = await meilisearchGetIngs();
    await msClient.deleteIndexIfExists("ingredients");
    const res = await msClient.index("ingredients").addDocuments(ings);
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

const meilisearchGetIngs = async () => {
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

const populateMyRecipes = async (userId: string) => {
  const ings = await db.ingredient.findMany();
  const file = 'C:/Users/rasmu/Documents/GitHub/MatPlanT3/prisma/data/recipes.json'
  const data = JSON.parse(readFileSync(file).toString());
  const parsed = z.array(zRecipe).safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  const recipes = parsed.data;
  for (const { instruction, ingredients, name, portions } of recipes) {
    const newIngs = ingredients.map(ing => {
      const foundIng = ings.find(i => i.name === ing.name);
      if (!foundIng) {
        throw new Error(`Not in db: ${ing.name}`)
      }
      return { ...ing, ingredientId: foundIng.id }
    })
    await db.recipe.create({ data: { instruction, name, portions, userId, ingredients: { createMany: { data: newIngs } } } })
  }
  console.log('Populated recipes');
}

const clearCatIngs = async () => {
  await db.ingredient.deleteMany();
  await db.category.deleteMany();
  await db.subcategory.deleteMany();
  console.log('All clear!');
}

const main = async () => {
  const userId = 'clob1ucl20000w5iwackgboef'
  await clearCatIngs();
  await populateCategories();
  await populateIngredients();
  await seedMeilisearch();
  await populateMyRecipes(userId);
};

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
