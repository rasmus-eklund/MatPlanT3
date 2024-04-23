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
import { slugify } from "~/lib/utils";
import type { StoreWithItems } from "../shared";

export const getAllStores = async () => {
  const user = await authorize();
  return await db.query.store.findMany({
    columns: { userId: false },
    where: (m, { eq }) => eq(m.userId, user.id),
  });
};

export const getStoreById = async (id: string) => {
  const user = await authorize();
  const foundStore = await db.query.store.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.id, id), eq(model.userId, user.id)),
    columns: {
      name: true,
      id: true,
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

export const getStoreBySlug = async (slug?: string) => {
  const user = await authorize();
  const slugFilter = slug
    ? and(eq(store.slug, slug), eq(store.userId, user.id))
    : eq(store.userId, user.id);
  const foundStore = await db.query.store.findFirst({
    where: slugFilter,
    columns: {
      name: true,
      id: true,
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
  const newStore: StoreInsert = {
    id: storeId,
    name,
    userId,
    slug: slugify(name),
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
  categories: StoreWithItems["store_categories"];
  subcategories: (StoreWithItems["store_categories"][number]["store_subcategories"][number] & {
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
  revalidatePath("/items");
};
