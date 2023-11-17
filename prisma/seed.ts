import { db } from "~/server/db";
import categories from "../backup/data/categories";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { z } from "zod";
import units from "~/constants/units";
import {
  meilisearchGetIngs,
  seedMeilisearchIngredients,
} from "~/server/meilisearch/seedIngredients";
import {
  meilisearchGetRecipes,
  seedMeilisearchRecipes,
} from "~/server/meilisearch/seedRecipes";

const ingredientsJsonFile =
  "C:/Users/rasmu/Documents/GitHub/MatPlanT3/backup/data/ingredients.json";
const recipeJsonFile =
  "C:/Users/rasmu/Documents/GitHub/MatPlanT3/backup/data/recipes.json";

const zIngredient = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  categoryId: z.coerce.number().positive(),
  subcategory: z.string().min(1),
  subcategoryId: z.coerce.number().positive(),
});
type Ingredient = z.infer<typeof zIngredient>;

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

type Recipe = z.infer<typeof zRecipe>;

const readDbIngredients = async () => {
  const ings = await db.ingredient.findMany({
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
    },
  });
  const ingredients = ings.map(
    ({
      category: { name: category },
      subcategory: { name: subcategory },
      categoryId,
      subcategoryId,
      name,
    }) => {
      const ing: Ingredient = {
        name,
        categoryId: categoryId + 1,
        subcategoryId: subcategoryId + 1,
        category,
        subcategory,
      };
      return ing;
    },
  );
  return ingredients;
};

const readLocalRecipes = () => {
  const raw = readFileSync(recipeJsonFile).toString();
  const parsed = z.array(zRecipe).safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.log(parsed.error.message);
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};

const readLocalIngredients = () => {
  const raw = JSON.parse(readFileSync(ingredientsJsonFile).toString());
  const parsed = z.array(zIngredient).safeParse(raw);
  if (!parsed.success) {
    console.log(parsed.error.message);
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};

const readDbRecipes = async (userId: string) => {
  const res = await db.recipe.findMany({
    where: { userId },
    include: { ingredients: true },
  });

  const data = res.map(({ ingredients, userId, id, ...rest }) => {
    return {
      ...rest,
      ingredients: ingredients.map(({ name, quantity, unit }) => ({
        name,
        quantity: Number(quantity),
        unit,
      })),
    };
  });
  const parsed = z.array(zRecipe).safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};

const saveRecipes = (recipes: Recipe[]) => {
  writeFileSync(recipeJsonFile, JSON.stringify(recipes, null, 2));
  console.log("Saved recipes");
};

const saveIngredients = (ingredients: Ingredient[]) => {
  writeFileSync(ingredientsJsonFile, JSON.stringify(ingredients, null, 2));
  console.log("Saved ingredients");
};

const backupData = async (userId: string) => {
  const recipes = await readDbRecipes(userId);
  const ingredients = await readDbIngredients();
  saveIngredients(ingredients);
  saveRecipes(recipes);
};

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
  console.log("Populated categories and subcategories");
};

const populateIngredients = async () => {
  await db.ingredient.deleteMany();
  const ingredients = readLocalIngredients();
  await db.ingredient.createMany({
    data: ingredients.map(({ categoryId, name, subcategoryId }) => ({
      categoryId,
      name,
      subcategoryId,
    })),
  });
  console.log("Populated ingredients");
};

const populateRecipes = async (userId: string) => {
  const dbIngredients = await db.ingredient.findMany();
  const recipes = readLocalRecipes();
  for (const { instruction, ingredients, name, portions } of recipes) {
    const newIngs = ingredients.map((ing) => {
      const foundIng = dbIngredients.find((i) => i.name === ing.name);
      if (!foundIng) {
        throw new Error(`Not in db: ${ing.name}`);
      }
      return { ...ing, ingredientId: foundIng.id };
    });
    await db.recipe.create({
      data: {
        instruction,
        name,
        portions,
        userId,
        ingredients: { createMany: { data: newIngs } },
      },
    });
  }
  console.log("Populated recipes");
};

const seedData = async (userId: string) => {
  await db.recipe.deleteMany();
  await db.ingredient.deleteMany();
  await db.category.deleteMany();
  await db.subcategory.deleteMany();
  await populateCategories();
  await populateIngredients();
  await populateRecipes(userId);
};

const main = async () => {
  const userId = "clou3769c0000jw085646i5ze";
  await backupData(userId);
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
