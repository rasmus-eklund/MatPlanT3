"use server";

import { count, eq } from "drizzle-orm";
import { db } from "../db";
import {
  category,
  ingredient,
  recipe_ingredient,
  subcategory,
  users,
} from "../db/schema";
import { getServerAuthSession } from "../auth";
import { zIngredientCat, type tIngredientCat } from "~/zod/zodSchemas";
import { seedMeilisearchIngredients } from "../meilisearch/seedIngredients";
import { revalidatePath } from "next/cache";

export const getUserCount = async () => {
  const user = await getServerAuthSession();
  if (!user?.admin) {
    throw new Error("UNAUTHORIZED");
  }
  const nrUsers = await db.select({ count: count(users.id) }).from(users);
  if (nrUsers[0]) {
    return nrUsers[0].count;
  }
  return 0;
};

export const getAllIngredients = async () => {
  const ingredients = await db
    .select({
      name: ingredient.name,
      id: ingredient.id,
      category: { name: category.name, id: category.id },
      subcategory: { name: subcategory.name, id: subcategory.id },
      count: count(recipe_ingredient),
    })
    .from(ingredient)
    .innerJoin(category, eq(ingredient.categoryId, category.id))
    .innerJoin(subcategory, eq(ingredient.subcategoryId, subcategory.id))
    .leftJoin(
      recipe_ingredient,
      eq(ingredient.id, recipe_ingredient.ingredientId),
    )
    .groupBy(ingredient.id, category.id, subcategory.id);
  return ingredients;
};


const getIngredient = async (id: string) => {
  const found = await db
    .select({
      name: ingredient.name,
      id: ingredient.id,
      category: { name: category.name, id: category.id },
      subcategory: { name: subcategory.name, id: subcategory.id },
      count: count(recipe_ingredient),
    })
    .from(ingredient)
    .where(eq(ingredient.id, id))
    .innerJoin(category, eq(ingredient.categoryId, category.id))
    .innerJoin(subcategory, eq(ingredient.subcategoryId, subcategory.id))
    .leftJoin(
      recipe_ingredient,
      eq(ingredient.id, recipe_ingredient.ingredientId),
    )
    .groupBy(ingredient.id, category.id, subcategory.id);
  if (!found[0]) {
    throw new Error("Not found");
  }
  return found[0];
};

export const addIngredient = async (data: unknown) => {
  const user = await getServerAuthSession();
  if (!user?.admin) {
    throw new Error("UNAUTHORIZED");
  }
  const parsed = zIngredientCat.safeParse(data);
  if (!parsed.success) {
    throw new Error("Incorrect data");
  }

  const res = await db
    .insert(ingredient)
    .values(parsed.data)
    .returning({ id: ingredient.id });
  if (!res[0]) {
    throw new Error("Could not find added ingredient");
  }
  await seedMeilisearchIngredients();
  revalidatePath("/admin/ingredients");
  const ing = getIngredient(res[0].id);
  return ing;
};

export const removeIngredient = async (id: string) => {
  await db.delete(ingredient).where(eq(ingredient.id, id));
  await seedMeilisearchIngredients();
  revalidatePath("/admin/ingredients");
};

export const updateIngredient = async ({
  id,
  ...data
}: tIngredientCat & { id: string }) => {
  await db.update(ingredient).set(data).where(eq(ingredient.id, id));
  await seedMeilisearchIngredients();
  const ing = await getIngredient(id);
  revalidatePath("/admin/ingredients");
  return ing;
};

// search: protectedProcedure
//   .input(SearchSchema)
//   .query(async ({ ctx, input: { search } }) => {
//     const res = await ctx.ms.index("ingredients").search(search);
//     const searchData = res.hits as MeilIngredient[];
//     return searchData;
//   }),

export const getAllCategories = async () => {
  const [categories, subcategories] = await Promise.all([
    db.query.category.findMany(),
    db.query.subcategory.findMany(),
  ]);
  return { categories, subcategories };
};

