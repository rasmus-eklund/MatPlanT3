"use server";

import { getRescaledRecipes, scaleIngredients } from "~/lib/utils";
import { type User } from "../auth";
import { db } from "../db";
import { items, menu } from "../db/schema";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { addLog } from "./auditLog";

export const getMenu = async (user: User) => {
  return await db.query.menu.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
    with: { recipe: { columns: { name: true, unit: true } } },
    orderBy: (m, { asc }) => asc(m.day),
  });
};

export const addToMenu = async (props: {
  id: string;
  quantity?: number;
  user: User;
}) => {
  const { id, quantity, user } = props;
  const recipe = await db.query.recipe.findFirst({
    columns: { quantity: true, name: true, unit: true },
    where: (r, { eq, and }) => and(eq(r.id, id), eq(r.userId, user.id)),
  });
  if (!recipe) {
    notFound();
  }
  const recipes = await getRescaledRecipes(
    id,
    quantity ?? recipe.quantity,
    [],
    user,
  );
  const menuId = randomUUID();
  const ingredients = recipes.flatMap((r) =>
    r.groups.flatMap((g) =>
      g.ingredients.map(
        ({ ingredientId, quantity, unit, id: recipeIngredientId }) => ({
          recipeIngredientId,
          ingredientId,
          quantity,
          unit,
          userId: user.id,
          menuId,
        }),
      ),
    ),
  );
  await db.transaction(async (tx) => {
    await tx.insert(menu).values({
      id: menuId,
      quantity: quantity ?? recipe.quantity,
      recipeId: id,
      userId: user.id,
    });
    await tx.insert(items).values(
      ingredients.map(
        ({ ingredientId, quantity, unit, recipeIngredientId }) => ({
          ingredientId,
          quantity,
          unit,
          userId: user.id,
          recipeIngredientId,
          menuId,
        }),
      ),
    );
  });
  addLog({
    method: "create",
    action: "addToMenu",
    data: { ...recipe, quantity },
    userId: user.id,
  });
  revalidatePath("/menu");
};

export const removeMenuItem = async ({
  id,
  name,
  user,
}: {
  id: string;
  name: string;
  user: User;
}) => {
  await db.delete(menu).where(and(eq(menu.id, id), eq(menu.userId, user.id)));
  addLog({
    method: "delete",
    action: "removeMenuItem",
    data: { name },
    userId: user.id,
  });
  revalidatePath("/menu");
};

type UpdateMenuDateProps = {
  id: string;
  day: string | null;
  user: User;
  name: string;
};
export const updateMenuDate = async ({
  id,
  day,
  user,
  name,
}: UpdateMenuDateProps) => {
  await db
    .update(menu)
    .set({ day })
    .where(and(eq(menu.id, id), eq(menu.userId, user.id)));
  addLog({
    method: "update",
    action: "updateMenuDate",
    data: { name, day },
    userId: user.id,
  });
  revalidatePath("/menu");
};

type UpdateMenuQuantityProps = {
  id: string;
  quantity: number;
  user: User;
};
export const updateMenuQuantity = async ({
  id,
  quantity,
  user,
}: UpdateMenuQuantityProps) => {
  const res = await db.query.menu.findFirst({
    where: (m, { eq, and }) => and(eq(m.id, id), eq(m.userId, user.id)),
    with: { items: true, recipe: { columns: { name: true } } },
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
  addLog({
    method: "update",
    action: "updateMenuQuantity",
    data: { name: res.recipe.name, quantity },
    userId: user.id,
  });
  revalidatePath("/menu");
  revalidatePath("/items");
};

export const getMenuItemById = async ({
  id,
  user,
}: {
  id: string;
  user: User;
}) => {
  const menuItem = await db.query.menu.findFirst({
    where: (m, { and, eq }) => and(eq(m.id, id), eq(m.userId, user.id)),
    columns: { recipeId: true, quantity: true },
  });

  if (!menuItem) {
    notFound();
  }

  const recipes = await getRescaledRecipes(
    menuItem.recipeId,
    menuItem.quantity,
    [],
    user,
  );
  return recipes;
};
