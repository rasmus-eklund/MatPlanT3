import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { zId, zIngredientCat, zSearchFilter } from "~/zod/zodSchemas";
import { SearchIngredient } from "types";

export const ingredientRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const ingredients = await ctx.db.ingredient.findMany({
      select: { name: true, id: true },
    });
    return ingredients.map((i) => i.name);
  }),

  add: protectedProcedure
    .input(zIngredientCat)
    .mutation(({ ctx, input: data }) => ctx.db.ingredient.create({ data })),

  remove: protectedProcedure.input(zId).mutation(({ ctx, input: { id } }) =>
    ctx.db.ingredient.delete({
      where: { id },
    }),
  ),

  update: protectedProcedure
    .input(z.object({ ing: zIngredientCat, id: z.string().min(1) }))
    .mutation(({ ctx, input: { ing: data, id } }) =>
      ctx.db.ingredient.update({ where: { id }, data }),
    ),

  search: protectedProcedure
    .input(zSearchFilter)
    .query(async ({ ctx, input: { search } }) => {
      const res = await ctx.ms.index("ingredients").search(search);
      const searchData = res.hits as SearchIngredient[];
      return searchData;
    }),
});
