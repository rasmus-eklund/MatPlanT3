import { storeRouter } from "~/server/api/routers/store";
import { createTRPCRouter } from "~/server/api/trpc";
import { recipeRouter } from "./routers/recipe";
import { ingredientRouter } from "./routers/ingredient";
import { menuRouter } from "./routers/menu";
import { itemRouter } from "./routers/items";
import { homeRouter } from "./routers/home";
import { adminRouter } from "./routers/admin";
import { externalRouter } from "./routers/external";
import { usersRouter } from "./routers/users";

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
  item: itemRouter,
  home: homeRouter,
  admin: adminRouter,
  external: externalRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
