import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { zId, zName } from "~/zod/zodSchemas";
import { removeMultiple } from "~/server/meilisearch/seedRecipes";

export const usersRouter = createTRPCRouter({
  getCount: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.db.user.count();
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            recipe: true,
            store: true,
            menu: true,
            shoppingListItem: true,
          },
        },
        image: true,
      },
    });
    return users.map(({ _count, ...rest }) => ({
      ...rest,
      ..._count,
    }));
  }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [recipesOwn, recipesPublic, menuItems, shoppingListItems, stores] =
      await Promise.all([
        ctx.db.recipe.count({ where: { userId } }),
        ctx.db.recipe.count({ where: { userId, isPublic: { equals: true } } }),
        ctx.db.menu.count({ where: { userId } }),
        ctx.db.shoppingListItem.count({ where: { userId } }),
        ctx.db.store.count({ where: { userId } }),
      ]);
    return { recipesOwn, recipesPublic, menuItems, shoppingListItems, stores };
  }),

  deleteUserById: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      const ids = await ctx.db.recipe.findMany({
        where: { userId: id },
        select: { id: true },
      });
      await Promise.all([
        removeMultiple(ids.map(({ id }) => id)),
        ctx.db.user.delete({ where: { id } }),
      ]);
    }),

  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    const id = ctx.session.user.id;
    const ids = await ctx.db.recipe.findMany({
      where: { userId: id },
      select: { id: true },
    });
    await Promise.all([
      removeMultiple(ids.map(({ id }) => id)),
      ctx.db.user.delete({ where: { id } }),
    ]);
  }),

  editUserName: protectedProcedure
    .input(zName)
    .mutation(async ({ ctx, input: { name } }) => {
      const id = ctx.session.user.id;
      await ctx.db.user.update({ where: { id }, data: { name } });
    }),
});
