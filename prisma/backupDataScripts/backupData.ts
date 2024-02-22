import { db } from "~/server/db";
import categories from "../categories";
import { readFileSync, writeFileSync } from "fs";
import { z } from "zod";
import units from "~/constants/units";

const ingredientsJsonFile =
  "C:/Users/rasmu/Documents/GitHub/MatPlanT3/backup/data/ingredients.json";
const recipeJsonFile =
  "C:/Users/rasmu/Documents/GitHub/MatPlanT3/backup/data/recipes.json";
const storesJsonFile =
  "C:/Users/rasmu/Documents/GitHub/MatPlanT3/backup/data/stores.json";

const zIngredient = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  categoryId: z.coerce.number(),
  subcategory: z.string().min(1),
  subcategoryId: z.coerce.number(),
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
        categoryId: categoryId,
        subcategoryId: subcategoryId,
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
    include: {
      ingredients: {
        select: {
          quantity: true,
          unit: true,
          ingredient: { select: { name: true } },
        },
      },
    },
  });

  const data = res.map(({ ingredients, userId, id, ...rest }) => {
    return {
      ...rest,
      ingredients: ingredients.map(
        ({ ingredient: { name }, quantity, unit }) => ({
          name,
          quantity: Number(quantity),
          unit,
        }),
      ),
    };
  });
  const parsed = z.array(zRecipe).safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};

type Store = {
  name: string;
  order: {
    categoryId: number;
    subcategoryId: number;
  }[];
};

const storeSchema = z.object({
  name: z.string().min(1),
  order: z.array(
    z.object({
      categoryId: z.coerce.number(),
      subcategoryId: z.coerce.number(),
    }),
  ),
});

const readDbStores = async (userId: string): Promise<Store[]> => {
  const res = await db.store.findMany({
    where: { userId },
    include: { order: { select: { categoryId: true, subcategoryId: true } } },
  });
  return res.map(({ name, order }) => ({ name, order }));
};

const saveStores = (stores: Store[]) => {
  writeFileSync(storesJsonFile, JSON.stringify(stores, null, 2));
  console.log("Saved stores");
};

const saveRecipes = (recipes: Recipe[]) => {
  writeFileSync(recipeJsonFile, JSON.stringify(recipes, null, 2));
  console.log("Saved recipes");
};

const saveIngredients = (ingredients: Ingredient[]) => {
  writeFileSync(ingredientsJsonFile, JSON.stringify(ingredients, null, 2));
  console.log("Saved ingredients");
};

const readLocalStores = () => {
  const raw = JSON.parse(readFileSync(storesJsonFile).toString());
  const parsed = z.array(storeSchema).safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
};

const backupData = async (userId: string) => {
  const recipes = await readDbRecipes(userId);
  const ingredients = await readDbIngredients();
  const stores = await readDbStores(userId);
  saveIngredients(ingredients);
  saveRecipes(recipes);
  saveStores(stores);
};

const populateStores = async (userId: string) => {
  const stores = readLocalStores();
  for (const { name, order } of stores) {
    await db.store.create({
      data: { name, userId, order: { createMany: { data: order } } },
    });
  }
};

const populateCategories = async () => {
  const cats = categories.map(({ category: name }, id) => ({ name, id }));
  await db.category.createMany({ data: cats });
  let id = 0;
  const subcats = categories.flatMap(({ category, subcategories }) =>
    subcategories.map((name) => ({
      name,
      categoryId: cats.find(({ name }) => name === category)!.id,
      id: id++,
    })),
  );
  await db.subcategory.createMany({ data: subcats });
  console.log("Populated categories and subcategories");
};

const populateIngredients = async () => {
  await db.ingredient.deleteMany();
  const categories = await db.category.findMany();
  const subcategories = await db.subcategory.findMany({
    include: { category: { select: { name: true } } },
  });
  const ingredients = readLocalIngredients();
  const data = ingredients.map(({ category, subcategory, name }) => {
    const categoryId = categories.findIndex(({ name }) => name === category);
    const subcategoryId = subcategories.findIndex(
      (i) => i.name === subcategory && i.category.name === category,
    );
    return { categoryId, name, subcategoryId };
  });
  await db.ingredient.createMany({ data });
  console.log("Populated ingredients");
};

const populateRecipes = async (userId: string) => {
  const dbIngredients = await db.ingredient.findMany();
  const recipes = readLocalRecipes();
  for (const { instruction, ingredients, name, portions } of recipes) {
    const newIngs = ingredients.map(({ name: ingName, ...ing }) => {
      const foundIng = dbIngredients.find((i) => i.name === ingName);
      if (!foundIng) {
        throw new Error(`Not in db: ${ingName}`);
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

export const seedData = async (userId: string) => {
  await db.store.deleteMany();
  await db.recipe.deleteMany();
  await db.ingredient.deleteMany();
  await db.category.deleteMany();
  await db.subcategory.deleteMany();
  await populateCategories();
  await populateIngredients();
  await populateRecipes(userId);
  await populateStores(userId);
};
