// import { addRecipesFromBackup } from "./recipes";

import { seedIngredients } from "./backup";
import { seedCategories } from "./seedCategories";

// import { seedMeilisearchIngredients } from "~/server/meilisearch/seedIngredients";
// import { seedMeilisearchRecipes } from "~/server/meilisearch/seedRecipes";
// import { backupIngredients } from "./backup";

const main = async () => {
  // await addRecipesFromBackup('')
  await seedCategories();
  await seedIngredients();
  // await seedMeilisearchRecipes();
  // await seedMeilisearchIngredients();
  // await backupIngredients();
};

main()
  .then(() => {
    console.log("Seed script ran.");
    process.exit(0);
  })
  .catch(() => {
    console.log("Something went wrong!");
    process.exit(1);
  });
