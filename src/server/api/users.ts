"use server";
import { db } from "../db";
import { items, menu, recipe, store, users } from "../db/schema";
import { count, eq } from "drizzle-orm";
import { removeMultiple } from "../meilisearch/seedRecipes";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { authorize } from "../auth";

export const createAccount = async () => {
  const user = await authorize();
  await db
    .insert(users)
    .values({
      authId: user.authId,
      email: user.email,
      image: user.picture,
      name: `${user.given_name} ${user.family_name}`,
    })
    .onConflictDoNothing();
  redirect("/");
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
        recipe: count(recipe.id),
        store: count(store.id),
        menu: count(menu.id),
        items: count(items.id),
      },
    })
    .from(users)
    .leftJoin(recipe, eq(users.id, recipe.userId))
    .leftJoin(store, eq(users.id, store.userId))
    .leftJoin(menu, eq(users.id, menu.userId))
    .leftJoin(items, eq(users.id, items.userId))
    .groupBy(users.id, recipe.id, store.id, menu.id, items.id);

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
        recipe: count(recipe.id),
        shared: count(recipe.isPublic),
        menu: count(menu.id),
        item: count(items.id),
        store: count(store.id),
      },
    })
    .from(users)
    .where(eq(users.authId, user.authId))
    .leftJoin(recipe, eq(recipe.userId, users.id))
    .leftJoin(menu, eq(menu.userId, users.id))
    .leftJoin(items, eq(items.userId, users.id))
    .leftJoin(store, eq(store.userId, users.id))
    .groupBy(users.id, recipe.id, menu.id, items.id, store.id);
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
  const removedUser = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ authId: users.authId });
  if (!removedUser[0]) {
    notFound();
  }

  if (user.authId === removedUser[0].authId) {
    console.log("User deleted himself");
    redirect("/api/auth/logout");
  }
  if (user.admin) {
    console.log("Admin deleted user");
    revalidatePath("/admin/users");
  }
};

export const renameUser = async (name: string) => {
  const user = await authorize();
  await db.update(users).set({ name }).where(eq(users.authId, user.authId));
  revalidatePath("/user");
};
