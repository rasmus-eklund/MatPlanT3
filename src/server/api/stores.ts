"use server";

import { db } from "../db";
import { store, store_category, store_subcategory } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { errorMessages } from "../errors";
import { randomUUID } from "crypto";
import { slugify } from "~/lib/utils";
import type { Store } from "../shared";
import { sideEffects } from "./sideEffects";

export const getAllStores = async () => {
  const user = await sideEffects.authorize();
  return db.query.store.findMany({
    columns: { userId: false },
    where: (m, { eq }) => eq(m.userId, user.id),
  });
};

export const setDefaultStore = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
  const selectedStore = await db.transaction(async (tx) => {
    const selected = await tx
      .update(store)
      .set({ default: true, updatedAt: new Date() })
      .where(and(eq(store.id, id), eq(store.userId, user.id)))
      .returning({ name: store.name });
    if (!selected[0]) {
      return undefined;
    }
    const stores = await tx.query.store.findMany({
      columns: { id: true, name: true },
      where: (m, { eq }) => eq(m.userId, user.id),
    });
    for (const s of stores) {
      if (s.id === id) {
        continue;
      }
      await tx
        .update(store)
        .set({ default: false })
        .where(and(eq(store.id, s.id), eq(store.userId, user.id)));
    }
    return selected[0];
  });
  if (!selectedStore) {
    return;
  }
  await sideEffects.addLog({
    method: "update",
    action: "setDefaultStore",
    data: { name: selectedStore.name },
    userId: user.id,
  });
  sideEffects.revalidatePath("/stores");
};

export const getStoreById = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
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
    return sideEffects.notFound();
  }

  return foundStore;
};

export const getAllStoresWithCategories = async () => {
  const user = await sideEffects.authorize();
  return db.query.store.findMany({
    where: (model, { eq }) => eq(model.userId, user.id),
    columns: {
      name: true,
      id: true,
      slug: true,
      default: true,
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
};

export const addStore = async ({ name }: { name: string }) => {
  const user = await sideEffects.authorize();
  try {
    await createNewStore({ userId: user.id, name });
    await sideEffects.addLog({
      method: "create",
      action: "addStore",
      data: { name },
      userId: user.id,
    });
    sideEffects.revalidatePath("/stores");
  } catch {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

export const deleteStore = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const user = await sideEffects.authorize();
  try {
    await db
      .delete(store)
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    sideEffects.revalidatePath("/stores");
    await sideEffects.addLog({
      method: "delete",
      action: "deleteStore",
      data: { name },
      userId: user.id,
    });
  } catch {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

export const renameStore = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const user = await sideEffects.authorize();
  try {
    await db
      .update(store)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    await sideEffects.addLog({
      method: "update",
      action: "renameStore",
      data: { name },
      userId: user.id,
    });
    sideEffects.revalidatePath("/stores");
  } catch {
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
  } catch {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

type UpdateStoreOrderProps = {
  categories: Store["store_categories"];
  subcategories: (Store["store_categories"][number]["store_subcategories"][number] & {
    categoryId: string;
  })[];
  storeId: string;
};
export const updateStoreOrder = async ({
  categories,
  subcategories,
  storeId,
}: UpdateStoreOrderProps) => {
  const user = await sideEffects.authorize();
  const res = await db.transaction(async (tx) => {
    const res = await tx
      .update(store)
      .set({ updatedAt: new Date() })
      .where(and(eq(store.id, storeId), eq(store.userId, user.id)))
      .returning({ name: store.name });
    if (!res[0]) {
      return res;
    }
    const ownedCategories = await tx.query.store_category.findMany({
      columns: { id: true },
      where: (model, { eq }) => eq(model.storeId, storeId),
    });
    const ownedCategoryIds = new Set(ownedCategories.map(({ id }) => id));
    for (const { id, order } of categories) {
      if (!ownedCategoryIds.has(id)) {
        continue;
      }
      await tx
        .update(store_category)
        .set({ order })
        .where(
          and(eq(store_category.id, id), eq(store_category.storeId, storeId)),
        );
    }
    for (const { id, order, categoryId } of subcategories) {
      if (!ownedCategoryIds.has(categoryId)) {
        continue;
      }
      const existingSubcategory = await tx.query.store_subcategory.findFirst({
        columns: { store_categoryId: true },
        where: (model, { eq }) => eq(model.id, id),
      });
      if (!ownedCategoryIds.has(existingSubcategory?.store_categoryId ?? "")) {
        continue;
      }
      await tx
        .update(store_subcategory)
        .set({ order, store_categoryId: categoryId })
        .where(eq(store_subcategory.id, id));
    }
    return res;
  });
  if (!res[0]) {
    return;
  }
  await sideEffects.addLog({
    method: "update",
    action: "updateStoreOrder",
    data: { name: res[0].name },
    userId: user.id,
  });
  sideEffects.revalidatePath(`/stores/${storeId}`);
  sideEffects.revalidatePath("/items");
};
