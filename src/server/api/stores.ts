"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "../auth";
import { db } from "../db";
import { store, store_category, store_subcategory } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { type tName } from "~/zod/zodSchemas";
import { notFound } from "next/navigation";
import { errorMessages } from "../errors";
import { randomUUID } from "crypto";
import type { CategoryItem } from "~/types";

export const getAllStores = async () => {
  const user = await authorize();
  const stores = await db
    .select({ id: store.id, name: store.name })
    .from(store)
    .where(eq(store.userId, user.id));
  return stores;
};

export const getStoreById = async (id: string) => {
  const user = await authorize();
  const foundStore = await db.query.store.findFirst({
    where: and(eq(store.id, id), eq(store.userId, user.id)),
    columns: {
      name: true,
      id: true,
    },
    with: {
      store_categories: {
        columns: { id: true, order: true },
        orderBy: store_category.order,
        with: {
          category: true,
          store_subcategories: {
            columns: { id: true, order: true },
            orderBy: store_subcategory.order,
            with: { subcategory: { columns: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!foundStore) {
    notFound();
  }
  const { store_categories, ...rest } = foundStore;
  const categories = store_categories.map(
    ({ id, category: { name }, store_subcategories, order }) => ({
      id: id.toString(),
      name,
      order,
      subcategories: store_subcategories.map(
        ({ id, subcategory: { name }, order }) => ({
          id: id.toString(),
          name,
          order,
        }),
      ),
    }),
  );
  return { ...rest, categories };
};

export const addStore = async ({ name }: tName) => {
  const user = await authorize();
  try {
    await createNewStore({ userId: user.id, name });
    revalidatePath("/stores");
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

export const deleteStore = async (id: string) => {
  const user = await authorize();
  try {
    await db
      .delete(store)
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    revalidatePath("/stores");
  } catch (error) {
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
  const user = await authorize();
  try {
    await db
      .update(store)
      .set({ name })
      .where(and(eq(store.id, id), eq(store.userId, user.id)));
    revalidatePath("/stores");
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

type CreateNewStoreProps = { userId: string; name: string };
export const createNewStore = async ({ name, userId }: CreateNewStoreProps) => {
  const categories = await db.query.category.findMany({
    with: { subcategories: true },
  });

  const storeId = randomUUID();
  type StoreInsert = typeof store.$inferInsert;
  const newStore: StoreInsert = { id: storeId, name, userId };
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
    await db.insert(store).values(newStore);
    await db.insert(store_category).values(newStoreCategories);
    await db.insert(store_subcategory).values(newStoreSubcategories);
  } catch (error) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
};

type UpdateStoreOrderProps = {
  categories: CategoryItem[];
  subcategories: (CategoryItem["subcategories"][number] & {
    categoryId: string;
  })[];
  storeId: string;
};
export const updateStoreOrder = async ({
  categories,
  subcategories,
  storeId,
}: UpdateStoreOrderProps) => {
  await authorize();
  await db.transaction(async (tx) => {
    for (const { id, order } of categories) {
      await tx
        .update(store_category)
        .set({ order })
        .where(eq(store_category.id, id));
    }
    for (const { id, order, categoryId } of subcategories) {
      await tx
        .update(store_subcategory)
        .set({ order, store_categoryId: categoryId })
        .where(eq(store_subcategory.id, id));
    }
  });
  revalidatePath(`/stores/${storeId}`);
};
