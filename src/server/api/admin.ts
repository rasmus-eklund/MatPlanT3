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
import { zIngredientCat, type tIngredientCat } from "~/zod/zodSchemas";
import { seedMeilisearchIngredients } from "../meilisearch/seedIngredients";
import { revalidatePath } from "next/cache";
import { authorize } from "../auth";
import { notFound } from "next/navigation";
import { errorMessages } from "../errors";

export const getUserCount = async () => {
  await authorize(true);
  const nrUsers = await db.select({ count: count(users.id) }).from(users);
  if (nrUsers[0]) {
    return nrUsers[0].count;
  }
  return 0;
};

export const getAllIngredients = async () => {
  await authorize(true);
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
  await authorize(true);
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
    notFound();
  }
  return found[0];
};

export const addIngredient = async (data: unknown) => {
  await authorize(true);
  const parsed = zIngredientCat.safeParse(data);
  if (!parsed.success) {
    throw new Error(errorMessages.INVALIDDATA);
  }
  const { categoryId, name, subcategoryId } = parsed.data;
  const res = await db
    .insert(ingredient)
    .values({ categoryId, name: name.toLowerCase().trim(), subcategoryId })
    .returning({ id: ingredient.id });
  if (!res[0]) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
  await seedMeilisearchIngredients();
  revalidatePath("/admin/ingredients");
};

export const removeIngredient = async (id: string) => {
  await authorize(true);
  await db.delete(ingredient).where(eq(ingredient.id, id));
  await seedMeilisearchIngredients();
  revalidatePath("/admin/ingredients");
};

export const updateIngredient = async ({
  id,
  ...data
}: tIngredientCat & { id: string }) => {
  await authorize(true);
  await db.update(ingredient).set(data).where(eq(ingredient.id, id));
  await seedMeilisearchIngredients();
  const ing = await getIngredient(id);
  revalidatePath("/admin/ingredients");
  return ing;
};

export const getAllCategories = async () => {
  await authorize(true);
  const [categories, subcategories] = await Promise.all([
    db.query.category.findMany(),
    db.query.subcategory.findMany(),
  ]);
  return { categories, subcategories };
};
