"use server";

import { revalidatePath } from "next/cache";
import { type User } from "../auth";
import { db } from "../db";
import { store, store_category, store_subcategory } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { errorMessages } from "../errors";
import { randomUUID } from "crypto";
import { slugify } from "~/lib/utils";
import type { Store } from "../shared";
import { addLog } from "./auditLog";

export const getAllStores = async ({ user }: { user: User }) => {
  return await db.query.store.findMany({
    columns: { userId: false },
    where: (m, { eq }) => eq(m.userId, user.id),
  });
};

export const setDefaultStore = async ({
  id,
  user,
}: {
  id: string;
  user: User;
}) => {
  const stores = await db.transaction(async (tx) => {
    await tx
      .update(store)
      .set({ default: true, updatedAt: new Date() })
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    const stores = await tx.query.store.findMany({
      columns: { id: true, name: true },
      where: (m, { eq }) => eq(m.userId, user.id),
    });
    for (const s of stores) {
      if (s.id === id) continue;
      await tx
        .update(store)
        .set({ default: false })
        .where(and(eq(store.id, s.id), eq(store.userId, user.id)));
    }
    return stores;
  });
  addLog({
    method: "update",
    action: "setDefaultStore",
    data: { name: stores.find((s) => s.id === id)?.name },
    userId: user.id,
  });
  revalidatePath("/stores");
};

export const getStoreById = async ({
  id,
  user,
}: {
  id: string;
  user: User;
}) => {
  const foundStore = await db.query.store.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.id, id), eq(model.userId, user.id)),
    columns: {
      name: true,
      id: true,
      slug: true,
    },
    with: {
      store_categories: {
        columns: { order: true, id: true },
        orderBy: (model, { asc }) => asc(model.order),
        with: {
          category: true,
          store_subcategories: {
            columns: { id: true, order: true },
            orderBy: (model, { asc }) => asc(model.order),
            with: { subcategory: { columns: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!foundStore) {
    notFound();
  }

  return foundStore;
};

export const getStoreBySlugOrFirst = async ({
  user,
  slug,
}: {
  user: User;
  slug?: string;
}) => {
  const slugFilter = slug
    ? and(eq(store.slug, slug), eq(store.userId, user.id))
    : and(eq(store.userId, user.id), eq(store.default, true));
  const foundStore = await db.query.store.findFirst({
    where: slugFilter,
    columns: {
      name: true,
      id: true,
      slug: true,
    },
    with: {
      store_categories: {
        columns: { order: true, id: true },
        orderBy: (model, { asc }) => asc(model.order),
        with: {
          category: true,
          store_subcategories: {
            columns: { id: true, order: true },
            orderBy: (model, { asc }) => asc(model.order),
            with: { subcategory: { columns: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!foundStore) {
    notFound();
  }
  return foundStore;
};

export const addStore = async ({
  name,
  user,
}: {
  name: string;
  user: User;
}) => {
  try {
    await createNewStore({ userId: user.id, name });
    addLog({
      method: "create",
      action: "addStore",
      data: { name },
      userId: user.id,
    });
    revalidatePath("/stores");
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

export const deleteStore = async ({
  id,
  user,
  name,
}: {
  id: string;
  user: User;
  name: string;
}) => {
  try {
    await db
      .delete(store)
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    revalidatePath("/stores");
    addLog({
      method: "delete",
      action: "deleteStore",
      data: { name },
      userId: user.id,
    });
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

export const renameStore = async ({
  id,
  name,
  user,
}: {
  id: string;
  name: string;
  user: User;
}) => {
  try {
    await db
      .update(store)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    addLog({
      method: "update",
      action: "renameStore",
      data: { name },
      userId: user.id,
    });
    revalidatePath("/stores");
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

type CreateNewStoreProps = {
  name: string;
  userId: string;
  isDefault?: boolean;
};
export const createNewStore = async ({
  name,
  userId,
  isDefault = false,
}: CreateNewStoreProps) => {
  const categories = await db.query.category.findMany({
    with: { subcategories: true },
  });

  const storeId = randomUUID();
  type StoreInsert = typeof store.$inferInsert;
  const newStore: StoreInsert = {
    id: storeId,
    name,
    userId,
    slug: slugify(name),
    default: isDefault,
  };
  type StoreCategoryInsert = typeof store_category.$inferInsert;
  const newStoreCategories: StoreCategoryInsert[] = [];
  type StoreSubcategoryInsert = typeof store_subcategory.$inferInsert;
  const newStoreSubcategories: StoreSubcategoryInsert[] = [];

  let catOrder = 0;
  for (const { id: categoryId, subcategories } of categories) {
    const store_categoryId = randomUUID();
    newStoreCategories.push({
      id: store_categoryId,
      categoryId,
      order: catOrder,
      storeId,
    });
    catOrder++;
    let subCatOrder = 0;
    for (const { id: subcategoryId } of subcategories) {
      newStoreSubcategories.push({
        order: subCatOrder,
        store_categoryId,
        subcategoryId,
      });
      subCatOrder++;
    }
  }
  try {
    const createdStore = await db
      .insert(store)
      .values(newStore)
      .returning({ id: store.id });
    await db.insert(store_category).values(newStoreCategories);
    await db.insert(store_subcategory).values(newStoreSubcategories);
    if (!createdStore[0]) {
      throw new Error(errorMessages.FAILEDINSERT);
    }
    return createdStore[0].id;
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

type UpdateStoreOrderProps = {
  categories: Store["store_categories"];
  subcategories: (Store["store_categories"][number]["store_subcategories"][number] & {
    categoryId: string;
  })[];
  storeId: string;
  user: User;
};
export const updateStoreOrder = async ({
  categories,
  subcategories,
  storeId,
  user,
}: UpdateStoreOrderProps) => {
  const res = await db.transaction(async (tx) => {
    const res = await tx
      .update(store)
      .set({ updatedAt: new Date() })
      .where(eq(store.id, storeId))
      .returning({ name: store.name });
    for (const { id, order } of categories) {
      await tx
        .update(store_category)
        .set({ order })
        .where(and(eq(store_category.id, id)));
    }
    for (const { id, order, categoryId } of subcategories) {
      await tx
        .update(store_subcategory)
        .set({ order, store_categoryId: categoryId })
        .where(eq(store_subcategory.id, id));
    }
    return res;
  });
  addLog({
    method: "update",
    action: "updateStoreOrder",
    data: { name: res[0]?.name },
    userId: user.id,
  });
  revalidatePath(`/stores/${storeId}`);
  revalidatePath("/items");
};
