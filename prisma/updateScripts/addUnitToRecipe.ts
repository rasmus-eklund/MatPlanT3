import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

/*
1. push to db:

	model recipe
	quantity         Int?
  unit             String?
  portions         Int
	
	model recipe_recipe
	quantity          Decimal?
  portions         Int
	
	model menu
	quantity          Decimal?
  portions         Int
	
	model store_category
	store not optional
	storeId not optional
	
2. run scripts

3. push to db:

	model recipe
	- rm portions
	- quant, unit not optional
	
	model recipe_recipe, menu
	- rm portions
	- quant not optional

4. Reseed meilisearch recipes
*/

type DB = PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
export const addQuantUnitToRecipe = async (db: DB) => {
  const recipes = await db.recipe.findMany();
  await Promise.all(
    // @ts-ignore
    recipes.map(({ id, portions }) =>
      db.recipe.update({
        where: { id },
        data: { quantity: portions, unit: "port" },
      }),
    ),
  );
  console.log("Successfully added quantity and unit to recipes.");
};

export const addQuantityToRecipeRecipe = async (db: DB) => {
  const recipes = await db.recipe_recipe.findMany();
  await Promise.all(
    // @ts-ignore
    recipes.map(({ id, portions }) =>
      db.recipe_recipe.update({ where: { id }, data: { quantity: portions } }),
    ),
  );
  console.log("Successfully added quantity to recipe_recipe.");
};

export const addQuantityToMenu = async (db: DB) => {
  const menu = await db.menu.findMany();
  await Promise.all(
    // @ts-ignore
    menu.map(({ id, portions }) =>
      db.menu.update({ where: { id }, data: { quantity: portions } }),
    ),
  );
  console.log("Successfully added quantity to menu.");
};
