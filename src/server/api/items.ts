"use server";

import { and, eq } from "drizzle-orm";
import { authorize } from "../auth";
import { db } from "../db";
import { items } from "../db/schema";
import { revalidatePath } from "next/cache";
import msClient from "../meilisearch/meilisearchClient";
import type { MeilIngredient } from "~/types";

export const getAllItems = async () => {
  const user = await authorize();
  const home = await db.query.home.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
  });
  const response = await db.query.items.findMany({
    columns: { userId: false },
    where: (model, { eq }) => eq(model.userId, user.id),
    with: {
      recipe: { columns: { name: true } },
      ingredient: {
        columns: { name: true },
        with: {
          category: { columns: { name: true, id: true } },
          subcategory: { columns: { name: true, id: true } },
        },
      },
    },
  });
  return response.map((ing) => ({
    ...ing,
    home: home.some((i) => i.ingredientId === ing.ingredientId),
  }));
};

export const checkItem = async ({
  id,
  checked,
}: {
  id: string;
  checked: boolean;
}) => {
  const user = await authorize();
  await db
    .update(items)
    .set({ checked })
    .where(and(eq(items.id, id), eq(items.userId, user.id)));
  revalidatePath("/items");
};

export const checkItems = async ({
  ids,
  checked,
}: {
  ids: string[];
  checked: boolean;
}) => {
  const user = await authorize();
  await db.transaction(async (tx) => {
    for (const id of ids) {
      await tx
        .update(items)
        .set({ checked })
        .where(and(eq(items.id, id), eq(items.userId, user.id)));
    }
  });
  revalidatePath("/items");
};

export const searchItem = async (search: string) => {
  const res = await msClient.index("ingredients").search(search);
  const searchData = res.hits as MeilIngredient[];
  return searchData;
};

export const addItem = async (item: MeilIngredient) => {
  const user = await authorize();
  await db.insert(items).values({
    ...item,
    quantity: 1,
    unit: "st",
    userId: user.id,
    checked: false,
  });
  revalidatePath("/items");
};