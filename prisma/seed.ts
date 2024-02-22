import { db } from "~/server/db";

import {
  meilisearchGetRecipes,
  seedMeilisearchRecipes,
} from "~/server/meilisearch/seedRecipes";
import {
  meilisearchGetIngs,
  seedMeilisearchIngredients,
} from "~/server/meilisearch/seedIngredients";
import {
  addQuantUnitToRecipe,
  addQuantityToMenu,
  addQuantityToRecipeRecipe,
} from "./updateScripts/addUnitToRecipe";

const main = async () => {
  // const userId = "";

  // await backupData(userId);
  // await seedData(userId);

  // await updateAllRecipes(await meilisearchGetRecipes(db));
  // await seedMeilisearchIngredients(await meilisearchGetIngs(db));
  // await addQuantUnitToRecipe(db);
  // await addQuantityToRecipeRecipe(db);
  // await addQuantityToMenu(db);
  // await seedMeilisearchRecipes(await meilisearchGetRecipes(db));
  // console.log("Empty seed script.");
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
