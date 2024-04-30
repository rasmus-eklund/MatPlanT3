"use server";

import {
  dateToString,
  ensureError,
  getAllContained,
  getAllContainedRecipesRescaled,
  rescaleRecipe,
  scaleIngredients,
} from "~/lib/utils";
import { authorize } from "../auth";
import { getRecipeById } from "./recipes";
import { db } from "../db";
import { items, menu } from "../db/schema";
import { randomUUID } from "crypto";
import { errorMessages } from "../errors";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export const getMenu = async () => {
  const user = await authorize();
  return await db.query.menu.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
    with: { recipe: { columns: { name: true, unit: true } } },
  });
};

export const addToMenu = async (id: string) => {
  const user = await authorize();
  const recipe = await getRecipeById(id);
  try {
    const allContained = await getAllContained(recipe, [id]);
    const ingredients = [
      ...recipe.ingredients.map((i) => ({
        ...i,
        recipeId: recipe.id,
      })),
      ...allContained,
    ];
    const menuId = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(menu).values({
        id: menuId,
        quantity: recipe.quantity,
        recipeId: recipe.id,
        userId: user.id,
      });
      await tx.insert(items).values(
        ingredients.map(({ ingredientId, quantity, unit, recipeId }) => ({
          ingredientId,
          quantity,
          unit,
          userId: user.id,
          recipeId,
          menuId,
        })),
      );
    });
  } catch (err) {
    const error = ensureError(err);
    if (error.message === errorMessages.CIRCULARREF) {
      throw new Error(errorMessages.CIRCULARREF);
    }
    throw new Error(errorMessages.FAILEDINSERT);
  }
  revalidatePath("/menu");
};

export const removeMenuItem = async (id: string) => {
  const user = await authorize();
  await db.delete(menu).where(and(eq(menu.id, id), eq(menu.userId, user.id)));
  revalidatePath("/menu");
};

export const updateMenuDate = async (id: string, date: Date) => {
  const user = await authorize();
  await db
    .update(menu)
    .set({ day: dateToString(date) })
    .where(and(eq(menu.id, id), eq(menu.userId, user.id)));
  revalidatePath("/menu");
};

export const updateMenuQuantity = async (id: string, quantity: number) => {
  const user = await authorize();
  const res = await db.query.menu.findFirst({
    where: (m, { eq, and }) => and(eq(m.id, id), eq(m.userId, user.id)),
    with: { items: true },
  });

  if (!res) {
    notFound();
  }
  const scale = quantity / res.quantity;
  const scaled = scaleIngredients(res.items, scale);
  await db.transaction(async (tx) => {
    await tx
      .update(menu)
      .set({ quantity })
      .where(and(eq(menu.id, id), eq(menu.userId, user.id)));
    for (const ing of scaled) {
      await tx
        .update(items)
        .set({ quantity: ing.quantity })
        .where(and(eq(items.id, ing.id), eq(items.userId, user.id)));
    }
  });
  revalidatePath("/menu");
  revalidatePath("/items");
};

export const getMenuItemById = async (id: string) => {
  const user = await authorize();
  const menuItem = await db.query.menu.findFirst({
    where: (m, { and, eq }) => and(eq(m.id, id), eq(m.userId, user.id)),
    columns: { recipeId: true, quantity: true },
  });

  if (!menuItem) {
    notFound();
  }

  const recipe = await getRecipeById(menuItem.recipeId);
  const scale = menuItem.quantity / recipe.quantity;
  const rescaled = rescaleRecipe(recipe, scale);
  const recipes = await getAllContainedRecipesRescaled(
    rescaled,
    [rescaled.id],
    scale,
  );
  return [rescaled, ...recipes];
};
