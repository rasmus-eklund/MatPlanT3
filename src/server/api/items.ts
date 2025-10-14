"use server";

import { and, eq, inArray } from "drizzle-orm";
import { authorize, type User } from "../auth";
import { db } from "../db";
import { home, item_comment, items } from "../db/schema";
import { revalidatePath } from "next/cache";
import msClient from "../meilisearch/meilisearchClient";
import type { MeilIngredient, Unit } from "~/types";
import type { Item } from "~/zod/zodSchemas";
import { addLog } from "./auditLog";

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
  removable,
  user,
}: {
  removable: { id: string; name: string }[];
  user: User;
}) => {
  await db.delete(items).where(
    and(
      inArray(
        items.id,
        removable.map((i) => i.id),
      ),
      eq(items.userId, user.id),
    ),
  );
  addLog({
    method: "delete",
    action: "removeCheckedItems",
    data: { items: removable.map((i) => i.name) },
    userId: user.id,
  });
  revalidatePath("/items");
};

export const checkItems = async ({
  ids,
  user,
}: {
  ids: { id: string; checked: boolean; name: string }[];
  user: User;
}) => {
  await db.transaction(async (tx) => {
    for (const { id, checked } of ids) {
      await tx
        .update(items)
        .set({ checked })
        .where(and(eq(items.id, id), eq(items.userId, user.id)));
    }
  });
  addLog({
    method: "update",
    action: "checkItems",
    data: { items: ids.map((i) => ({ name: i.name, checked: i.checked })) },
    userId: user.id,
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

export const addItem = async ({
  item,
  user,
}: {
  item: {
    id: string;
    quantity: number;
    unit: Unit;
    name: string;
  };
  user: User;
}) => {
  const { id, quantity, unit, name } = item;
  await db.insert(items).values({
    ingredientId: id,
    quantity,
    unit,
    userId: user.id,
    checked: false,
  });
  await removeHome({ ids: [item.id], user });
  addLog({
    method: "create",
    action: "addItem",
    data: { name, quantity, unit },
    userId: user.id,
  });
  revalidatePath("/items");
};

export const updateItem = async ({
  item: { id, ingredientId, quantity, unit, name },
  user,
}: {
  item: Item;
  user: User;
}) => {
  await db
    .update(items)
    .set({ quantity, unit, ingredientId })
    .where(and(eq(items.id, id), eq(items.userId, user.id)));
  addLog({
    method: "update",
    action: "updateItem",
    data: { name, quantity, unit },
    userId: user.id,
  });
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
  items,
  user,
}: {
  home: boolean;
  items: { id: string; name: string }[];
  user: User;
}) => {
  if (home) {
    await removeHome({ ids: items.map((i) => i.id), user });
    addLog({
      method: "update",
      action: "removeHome",
      data: { items: items.map((i) => i.name) },
      userId: user.id,
    });
  } else {
    await addHome({ ids: items.map((i) => i.id), user });
    addLog({
      method: "update",
      action: "addHome",
      data: { items: items.map((i) => i.name) },
      userId: user.id,
    });
  }
  revalidatePath("/items");
};

type Comment = {
  comment: string;
  item: { id: string; name: string };
  user: User;
};
export const addComment = async ({ comment, item, user }: Comment) => {
  await db.insert(item_comment).values({ comment, itemId: item.id });
  addLog({
    method: "create",
    action: "addComment",
    data: { comment, ingredient: item.name },
    userId: user.id,
  });
  revalidatePath("/items");
};

export const updateComment = async ({
  comment,
  commentId,
  name,
  user,
}: {
  comment: string;
  commentId: string;
  name: string;
  user: User;
}) => {
  await authorize();
  await db
    .update(item_comment)
    .set({ comment })
    .where(eq(item_comment.id, commentId));
  addLog({
    method: "update",
    action: "updateComment",
    data: { comment, ingredient: name },
    userId: user.id,
  });
  revalidatePath("/items");
};

export const deleteComment = async ({
  commentId,
  name,
  user,
}: {
  commentId: string;
  name: string;
  user: User;
}) => {
  await db.delete(item_comment).where(eq(item_comment.id, commentId));
  addLog({
    method: "delete",
    action: "deleteComment",
    data: { name },
    userId: user.id,
  });
  revalidatePath("/items");
};
