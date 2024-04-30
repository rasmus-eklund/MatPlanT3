"use server";
import { db } from "../db";
import { items, menu, recipe, store, users } from "../db/schema";
import { countDistinct, eq } from "drizzle-orm";
import { removeMultiple } from "../meilisearch/seedRecipes";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { authorize } from "../auth";
import { createNewStore } from "~/server/api/stores";
import type { CreateAccount } from "~/zod/zodSchemas";
import { randomUUID } from "crypto";

type User = CreateAccount & { image: string | null; authId: string };

export const createAccount = async (user: User) => {
  const userId = randomUUID();
  await db
    .insert(users)
    .values({ ...user, id: userId })
    .onConflictDoNothing();

  await createNewStore({ name: "Ny affär", userId });
  redirect("/");
};

export const hasAccount = async (authId: string) => {
  const user = await db.query.users.findFirst({
    where: (m, { eq }) => eq(m.authId, authId),
  });
  if (!user) {
    return false;
  }
  return true;
};

export const getAllUsers = async () => {
  await authorize(true);
  const data = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      count: {
        items: countDistinct(items.id),
        store: countDistinct(store.id),
        recipe: countDistinct(recipe.id),
        menu: countDistinct(menu.id),
      },
    })
    .from(users)
    .leftJoin(items, eq(items.userId, users.id))
    .leftJoin(store, eq(store.userId, users.id))
    .leftJoin(recipe, eq(recipe.userId, users.id))
    .leftJoin(menu, eq(menu.userId, users.id))
    .groupBy(users.id);

  return data;
};

export const getUserStats = async () => {
  const user = await authorize();
  const res = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      count: {
        recipe: countDistinct(recipe.id),
        menu: countDistinct(menu.id),
        item: countDistinct(items.id),
        store: countDistinct(store.id),
      },
    })
    .from(users)
    .where(eq(users.id, user.id))
    .leftJoin(recipe, eq(recipe.userId, users.id))
    .leftJoin(menu, eq(menu.userId, users.id))
    .leftJoin(items, eq(items.userId, users.id))
    .leftJoin(store, eq(store.userId, users.id))
    .groupBy(users.id);
  if (!res[0]) {
    notFound();
  }
  return res[0];
};

export const deleteUserById = async (id: string) => {
  const user = await authorize();
  const ids = await db
    .select({ id: recipe.id })
    .from(recipe)
    .where(eq(recipe.userId, id));

  await removeMultiple(ids.map(({ id }) => id));
  await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ authId: users.authId });
  if (user.id === id) {
    redirect("/api/auth/logout");
  }
  if (user.admin) {
    revalidatePath("/admin/users");
  }
};

export const renameUser = async (name: string) => {
  const user = await authorize();
  await db.update(users).set({ name }).where(eq(users.id, user.id));
  revalidatePath("/user");
};
