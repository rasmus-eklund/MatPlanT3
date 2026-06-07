"use server";

import { and, eq, inArray } from "drizzle-orm";
import { type User } from "../auth";
import { db } from "../db";
import { home, item_comment, items } from "../db/schema";
import type { MeilIngredient, Unit } from "~/types";
import type { Item } from "~/zod/zodSchemas";
import { sideEffects } from "./sideEffects";

export const getAllItems = async () => {
  const user = await sideEffects.authorize();
  const home = await db.query.home.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
  });
  const homeSet = new Set(home.map((h) => h.ingredientId));

  const response = await db.query.items.findMany({
    columns: { userId: false },
    where: (model, { eq }) => eq(model.userId, user.id),
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
    home: homeSet.has(ing.ingredientId),
  }));
};

const getItemById = async ({ id, user }: { id: string; user: User }) => {
  const homeRows = await db.query.home.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
  });
  const homeSet = new Set(homeRows.map((h) => h.ingredientId));

  const item = await db.query.items.findFirst({
    columns: { userId: false },
    where: (model, { eq, and }) =>
      and(eq(model.id, id), eq(model.userId, user.id)),
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

  if (!item) throw new Error("NOT FOUND");
  return {
    ...item,
    comments: item.comments[0],
    home: homeSet.has(item.ingredientId),
  };
};

export const removeCheckedItems = async ({
  removable,
}: {
  removable: { id: string; name: string }[];
}) => {
  const user = await sideEffects.authorize();
  await db.delete(items).where(
    and(
      inArray(
        items.id,
        removable.map((i) => i.id),
      ),
      eq(items.userId, user.id),
    ),
  );
  await sideEffects.addLog({
    method: "delete",
    action: "removeCheckedItems",
    data: { items: removable.map((i) => i.name) },
    userId: user.id,
  });
};

export const checkItems = async ({
  ids,
}: {
  ids: { id: string; checked: boolean; name: string }[];
}) => {
  const user = await sideEffects.authorize();
  await db.transaction(async (tx) => {
    for (const { id, checked } of ids) {
      await tx
        .update(items)
        .set({ checked })
        .where(and(eq(items.id, id), eq(items.userId, user.id)));
    }
  });
  await sideEffects.addLog({
    method: "update",
    action: "checkItems",
    data: { items: ids.map((i) => ({ name: i.name, checked: i.checked })) },
    userId: user.id,
  });
};

export const searchItem = async (props: { search: string }) => {
  const res = await sideEffects.ingredientSearch(props.search);
  const searchData = res.hits as MeilIngredient[];
  return searchData.map((i) => ({
    id: i.ingredientId,
    name: i.name,
    unit: "st" as Unit,
    quantity: 1,
  }));
};

export const addItem = async ({
  item,
}: {
  item: {
    id: string;
    quantity: number;
    unit: Unit;
    name: string;
  };
}) => {
  const user = await sideEffects.authorize();
  const { id, quantity, unit, name } = item;
  const [createdItem] = await db
    .insert(items)
    .values({
      ingredientId: id,
      quantity,
      unit,
      userId: user.id,
      checked: false,
    })
    .returning({ id: items.id });
  await removeHome({ ids: [item.id], user });
  await sideEffects.addLog({
    method: "create",
    action: "addItem",
    data: { name, quantity, unit },
    userId: user.id,
  });
  if (!createdItem) throw new Error("NOT FOUND");
  return await getItemById({ id: createdItem.id, user });
};

export const updateItem = async ({
  item: { id, ingredientId, quantity, unit, name },
}: {
  item: Item;
}) => {
  const user = await sideEffects.authorize();
  await db
    .update(items)
    .set({ quantity, unit, ingredientId })
    .where(and(eq(items.id, id), eq(items.userId, user.id)));
  await sideEffects.addLog({
    method: "update",
    action: "updateItem",
    data: { name, quantity, unit },
    userId: user.id,
  });
  return await getItemById({ id, user });
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
  items,
}: {
  home: boolean;
  items: { id: string; name: string }[];
}) => {
  const user = await sideEffects.authorize();
  if (home) {
    await removeHome({ ids: items.map((i) => i.id), user });
    await sideEffects.addLog({
      method: "update",
      action: "removeHome",
      data: { items: items.map((i) => i.name) },
      userId: user.id,
    });
  } else {
    await addHome({ ids: items.map((i) => i.id), user });
    await sideEffects.addLog({
      method: "update",
      action: "addHome",
      data: { items: items.map((i) => i.name) },
      userId: user.id,
    });
  }
};

type Comment = {
  comment: string;
  item: { id: string; name: string };
};
export const addComment = async ({ comment, item }: Comment) => {
  const user = await sideEffects.authorize();
  await getItemById({ id: item.id, user });
  const [createdComment] = await db
    .insert(item_comment)
    .values({ comment, itemId: item.id })
    .returning();
  await sideEffects.addLog({
    method: "create",
    action: "addComment",
    data: { comment, ingredient: item.name },
    userId: user.id,
  });
  if (!createdComment) throw new Error("NOT FOUND");
  return createdComment;
};

export const updateComment = async ({
  comment,
  commentId,
  name,
}: {
  comment: string;
  commentId: string;
  name: string;
}) => {
  const user = await sideEffects.authorize();
  const existingComment = await db.query.item_comment.findFirst({
    where: eq(item_comment.id, commentId),
    with: { item: { columns: { userId: true } } },
  });
  if (existingComment?.item.userId !== user.id) throw new Error("NOT FOUND");
  const [updatedComment] = await db
    .update(item_comment)
    .set({ comment })
    .where(eq(item_comment.id, commentId))
    .returning();
  await sideEffects.addLog({
    method: "update",
    action: "updateComment",
    data: { comment, ingredient: name },
    userId: user.id,
  });
  if (!updatedComment) throw new Error("NOT FOUND");
  return updatedComment;
};

export const deleteComment = async ({
  commentId,
  name,
}: {
  commentId: string;
  name: string;
}) => {
  const user = await sideEffects.authorize();
  const existingComment = await db.query.item_comment.findFirst({
    where: eq(item_comment.id, commentId),
    with: { item: { columns: { userId: true } } },
  });
  if (existingComment?.item.userId !== user.id) throw new Error("NOT FOUND");
  await db.delete(item_comment).where(eq(item_comment.id, commentId));
  await sideEffects.addLog({
    method: "delete",
    action: "deleteComment",
    data: { name },
    userId: user.id,
  });
};
