import { storeRouter } from "~/server/api/routers/store";
import { createTRPCRouter } from "~/server/api/trpc";
import { recipeRouter } from "./routers/recipe";
import { ingredientRouter } from "./routers/ingredient";
import { menuRouter } from "./routers/menu";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  store: storeRouter,
  recipe: recipeRouter,
  ingredient: ingredientRouter,
  menu: menuRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
