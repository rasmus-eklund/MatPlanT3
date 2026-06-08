"use server";
import { db } from "../db";
import { auditLog, items, menu, recipe, store, users } from "../db/schema";
import { count, countDistinct, eq, max } from "drizzle-orm";
import { removeMultiple } from "../meilisearch/seedRecipes";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createNewStore } from "~/server/api/stores";
import type { CreateAccount } from "~/zod/zodSchemas";
import { randomUUID } from "crypto";
import { authorize } from "../auth";
import { addLog } from "./auditLog";

type UserData = CreateAccount & { image: string | null; authId: string };

export const createAccount = async ({ userData }: { userData: UserData }) => {
  const userId = randomUUID();
  await db
    .insert(users)
    .values({ ...userData, id: userId })
    .onConflictDoNothing();

  await createNewStore({ name: "Ny affär", userId, isDefault: true });
  redirect("/menu");
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

  const [
    userRows,
    itemCounts,
    storeCounts,
    recipeCounts,
    menuCounts,
    auditActivity,
  ] = await Promise.all([
    db.select().from(users),
    db
      .select({ userId: items.userId, count: count(items.id) })
      .from(items)
      .groupBy(items.userId),
    db
      .select({ userId: store.userId, count: count(store.id) })
      .from(store)
      .groupBy(store.userId),
    db
      .select({ userId: recipe.userId, count: count(recipe.id) })
      .from(recipe)
      .groupBy(recipe.userId),
    db
      .select({ userId: menu.userId, count: count(menu.id) })
      .from(menu)
      .groupBy(menu.userId),
    db
      .select({ userId: auditLog.userId, lastAuditAt: max(auditLog.createdAt) })
      .from(auditLog)
      .groupBy(auditLog.userId),
  ]);

  const countsByUser = {
    items: new Map(itemCounts.map(({ userId, count }) => [userId, count])),
    store: new Map(storeCounts.map(({ userId, count }) => [userId, count])),
    recipe: new Map(recipeCounts.map(({ userId, count }) => [userId, count])),
    menu: new Map(menuCounts.map(({ userId, count }) => [userId, count])),
  };
  const auditActivityByUser = new Map(
    auditActivity.map(({ userId, lastAuditAt }) => [userId, lastAuditAt]),
  );

  return userRows.map(
    ({ id, email, name, image, createdAt, lastActiveAt }) => ({
      id,
      email,
      name,
      image,
      createdAt,
      lastActiveAt,
      lastAuditAt: auditActivityByUser.get(id) ?? null,
      count: {
        items: countsByUser.items.get(id) ?? 0,
        store: countsByUser.store.get(id) ?? 0,
        recipe: countsByUser.recipe.get(id) ?? 0,
        menu: countsByUser.menu.get(id) ?? 0,
      },
    }),
  );
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

export const deleteUserById = async ({ id }: { id: string }) => {
  let user = await authorize();
  if (user.id !== id) {
    user = await authorize(true);
  }
  if (user.id !== id && !user.admin) {
    notFound();
  }

  const ids = await db
    .select({ id: recipe.id })
    .from(recipe)
    .where(eq(recipe.userId, id));

  await removeMultiple(ids.map(({ id }) => id));
  await db.delete(users).where(eq(users.id, id));
  if (user.id === id) {
    redirect("/api/auth/logout");
  }
  if (user.admin) {
    revalidatePath("/admin/users");
  }
};

export const renameUser = async ({ name }: { name: string }) => {
  const user = await authorize();
  await db.update(users).set({ name }).where(eq(users.id, user.id));
  await addLog({
    method: "update",
    action: "renameUser",
    data: { name },
    userId: user.id,
  });
  revalidatePath("/user");
};
