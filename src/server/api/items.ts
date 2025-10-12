"use server";

import { and, eq, inArray } from "drizzle-orm";
import { authorize, type User } from "../auth";
import { db } from "../db";
import { home, item_comment, items } from "../db/schema";
import { revalidatePath } from "next/cache";
import msClient from "../meilisearch/meilisearchClient";
import type { MeilIngredient, Unit } from "~/types";
import type { Item } from "~/zod/zodSchemas";

export const getAllItems = async ({
  user,
  menuId,
}: {
  user: User;
  menuId?: string;
}) => {
  const home = await db.query.home.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
  });

  const response = await db.query.items.findMany({
    columns: { userId: false },
    where: (model, { eq, and, isNull }) => {
      if (menuId) {
        return and(
          eq(model.userId, user.id),
          menuId === "nonRecipeItems"
            ? isNull(model.menuId)
            : eq(model.menuId, menuId),
        );
      }
      return eq(model.userId, user.id);
    },
    with: {
      menu: { with: { recipe: { columns: { name: true } } } },
      ingredient: {
        columns: { name: true },
        with: {
          category: { columns: { name: true, id: true } },
          subcategory: { columns: { name: true, id: true } },
        },
      },
      comments: true,
    },
  });
  return response.map((ing) => ({
    ...ing,
    comments: ing.comments[0],
    home: home.some((i) => i.ingredientId === ing.ingredientId),
  }));
};

export const removeCheckedItems = async ({
  ids,
  user,
}: {
  ids: string[];
  user: User;
}) => {
  await db
    .delete(items)
    .where(and(inArray(items.id, ids), eq(items.userId, user.id)));
  revalidatePath("/items");
};

export const checkItems = async ({
  ids,
}: {
  ids: { id: string; checked: boolean; user: User }[];
}) => {
  await db.transaction(async (tx) => {
    for (const { id, checked, user } of ids) {
      await tx
        .update(items)
        .set({ checked })
        .where(and(eq(items.id, id), eq(items.userId, user.id)));
    }
  });
  revalidatePath("/items");
};

export const searchItem = async (props: { search: string }) => {
  const res = await msClient.index("ingredients").search(props.search);
  const searchData = res.hits as MeilIngredient[];
  return searchData.map((i) => ({
    id: i.ingredientId,
    name: i.name,
    unit: "st" as Unit,
    quantity: 1,
  }));
};

export const addItem = async (
  item: {
    id: string;
    quantity: number;
    unit: Unit;
  },
  user: User,
) => {
  const { id, quantity, unit } = item;
  await db.insert(items).values({
    ingredientId: id,
    quantity,
    unit,
    userId: user.id,
    checked: false,
  });
  await removeHome({ ids: [item.id], user });
  revalidatePath("/items");
};

export const updateItem = async ({
  item: { id, ingredientId, quantity, unit },
  user,
}: {
  item: Omit<Item, "name">;
  user: User;
}) => {
  await db
    .update(items)
    .set({ quantity, unit, ingredientId })
    .where(and(eq(items.id, id), eq(items.userId, user.id)));
  revalidatePath("/items");
};

const addHome = async ({ ids, user }: { ids: string[]; user: User }) => {
  await db
    .insert(home)
    .values(ids.map((ingredientId) => ({ ingredientId, userId: user.id })));
};

const removeHome = async ({ ids, user }: { ids: string[]; user: User }) => {
  await db.transaction(async (tx) => {
    for (const id of ids) {
      await tx
        .delete(home)
        .where(and(eq(home.ingredientId, id), eq(home.userId, user.id)));
    }
  });
};

export const toggleHome = async ({
  home,
  ids,
  user,
}: {
  home: boolean;
  ids: string[];
  user: User;
}) => {
  if (home) {
    await removeHome({ ids, user });
  } else {
    await addHome({ ids, user });
  }
  revalidatePath("/items");
};

type Comment = { comment: string; itemId: string };
export const addComment = async ({ comment, itemId }: Comment) => {
  await authorize();
  await db.insert(item_comment).values({ comment, itemId });
  revalidatePath("/items");
};

export const updateComment = async ({
  comment,
  commentId,
}: {
  comment: string;
  commentId: string;
}) => {
  await authorize();
  await db
    .update(item_comment)
    .set({ comment })
    .where(eq(item_comment.id, commentId));
  revalidatePath("/items");
};

export const deleteComment = async (itemId: string) => {
  await authorize();
  await db.delete(item_comment).where(eq(item_comment.id, itemId));
  revalidatePath("/items");
};
