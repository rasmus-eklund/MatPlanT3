import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  category,
  store,
  store_category,
  subcategory,
} from "~/server/db/schema";
import { errorMessages } from "~/server/errors";

type Props = { userId: string; name: string };
export const createNewStore = async ({ name, userId }: Props) => {
  const categories = await db
    .select({ categoryId: category.id, subcategoryId: subcategory.id })
    .from(category)
    .innerJoin(subcategory, eq(category.id, subcategory.categoryId));

  const newStore = await db
    .insert(store)
    .values({ name, userId })
    .returning({ id: store.id });
  if (!newStore[0]) {
    throw new Error(errorMessages.FAILEDINSERT);
  }
  const storeId = newStore[0].id;
  await db
    .insert(store_category)
    .values(categories.map((c) => ({ ...c, storeId })));

  return newStore;
};
