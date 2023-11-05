import formatQuantityUnit from "~/server/helpers/formatQuantityUnit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { zChecked, zId, zIngredient, zIngredientAdd } from "~/zod/zodSchemas";
import { z } from "zod";

export const itemRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const res = await ctx.db.shoppingListItem.findMany({
      where: { userId },
      include: {
        recipe: { select: { name: true } },
        menu: { select: { recipe: { select: { name: true } } } },
        ingredient: { select: { subcategoryId: true } },
      },
    });
    const home = await ctx.db.home.findMany({ where: { userId } });
    const ings = formatQuantityUnit(res).map(
      ({ recipe, menu, ingredient, ...ing }) => ({
        menu: menu ? menu.recipe.name : "",
        recipe: recipe ? recipe.name : "",
        ...ing,
        home: home.some((i) => i.ingredientId === ing.ingredientId),
        subcategoryId: ingredient.subcategoryId,
      }),
    );
    return ings;
  }),

  add: protectedProcedure
    .input(zIngredientAdd)
    .mutation(async ({ ctx, input: { ingredientId, name } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.shoppingListItem.create({
        data: {
          checked: false,
          userId,
          name,
          ingredientId,
          quantity: 1,
          unit: "st",
        },
      });
    }),

  delete: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.db.shoppingListItem.delete({ where: { id } });
    }),

  edit: protectedProcedure
    .input(zIngredient)
    .mutation(async ({ ctx, input: { id, quantity, unit } }) => {
      await ctx.db.shoppingListItem.update({
        where: { id },
        data: { quantity, unit },
      });
    }),

  check: protectedProcedure
    .input(zChecked)
    .mutation(async ({ ctx, input: { id, checked } }) => {
      await ctx.db.shoppingListItem.update({
        where: { id },
        data: { checked },
      });
    }),

  checkMultiple: protectedProcedure
    .input(z.object({ ids: z.array(zId), checked: z.boolean() }))
    .mutation(async ({ ctx, input: { checked, ids } }) => {
      await ctx.db.shoppingListItem.updateMany({
        where: { id: { in: ids.map((i) => i.id) } },
        data: { checked },
      });
    }),
});
