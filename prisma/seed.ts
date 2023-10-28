import { db } from "~/server/db";
import categories from "./data/categories";
import ingredients from "./data/ingredients";

const populateCategories = async () => {
  const cats = categories.map((cat, id) => ({
    name: cat.category,
    id: id + 1,
  }));
  await db.category.createMany({ data: cats });
  let id = 1;
  const subcats = categories.flatMap((c) =>
    c.subcategories.map((s) => ({
      name: s,
      categoryId: cats.find((i) => i.name === c.category)!.id,
      id: id++,
    })),
  );
  await db.subcategory.createMany({ data: subcats });
  console.log("Populated all categories and subcategories");
};

const populateIngredients = async () => {
  await db.ingredient.createMany({
    data: ingredients.map((i) => ({
      categoryId: i.categoryId,
      name: i.name,
      subcategoryId: i.subcategoryId,
    })),
  });
  console.log("Populated ingredients");
};

const main = async () => {
  await populateCategories();
  await populateIngredients();
};

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
