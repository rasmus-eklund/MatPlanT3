// import { seedCategories, seedIngredients } from "./scripts";

// import { addRecipesFromBackup } from "./recipes";

// import { seedMeilisearchIngredients } from "~/server/meilisearch/seedIngredients";

// import { seedMeilisearchRecipes } from "~/server/meilisearch/seedRecipes";

const main = async () => {
  // await addRecipesFromBackup('')
  // await seedCategories();
  // await seedIngredients();
  // await seedMeilisearchRecipes();
  // await seedMeilisearchIngredients();
};

main()
  .then(() => console.log("Seed script ran."))
  .catch(() => console.log("Something went wrong!"));
