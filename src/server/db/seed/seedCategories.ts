/* eslint-disable drizzle/enforce-delete-with-where */

import { db } from "~/server/db";
import { category, subcategory } from "~/server/db/schema";
import categories from "./categories";

export const seedCategories = async () => {
  await db.delete(category);
  await db.delete(subcategory);
  const cats = categories.map(({ category: name }, id) => ({ name, id }));
  await db.insert(category).values(cats);
  let id = 0;
  const subcats: (typeof subcategory.$inferInsert)[] = [];
  for (const { category, subcategories } of categories) {
    for (const name of subcategories) {
      subcats.push({
        categoryId: cats.find(({ name }) => name === category)!.id,
        name,
        id,
      });
      id++;
    }
  }
  await db.insert(subcategory).values(subcats);
  console.log("Populated categories and subcategories");
};
