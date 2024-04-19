// import { seedCategories, seedIngredients } from "./scripts";

// import { seedMeilisearchIngredients } from "~/server/meilisearch/seedIngredients";

// import { seedMeilisearchRecipes } from "~/server/meilisearch/seedRecipes";

const main = async () => {
  // await seedCategories();
  // await seedIngredients();
  // await seedMeilisearchRecipes()
  // await seedMeilisearchIngredients();
};

main()
  .catch(() => console.log("Something went wrong!"))
  .finally(() => console.log("Seed script ran."));
