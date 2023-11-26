import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { zId, zIngredientCat, SearchSchema } from "~/zod/zodSchemas";
import { MeilIngredient } from "types";
import {
  meilisearchGetIngs,
  seedMeilisearchIngredients,
} from "~/server/meilisearch/seedIngredients";

export const adminRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const ingredients = await ctx.db.ingredient.findMany({
      select: {
        name: true,
        id: true,
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        _count: { select: { recipe_ingredient: true } },
      },
    });
    return ingredients.map(({ _count, ...i }) => ({
      ...i,
      count: _count.recipe_ingredient,
    }));
  }),

  add: protectedProcedure
    .input(zIngredientCat)
    .mutation(async ({ ctx, input: data }) => {
      const ing = await ctx.db.ingredient.create({
        data,
        select: {
          name: true,
          id: true,
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
      });
      await seedMeilisearchIngredients(await meilisearchGetIngs(ctx.db));
      return ing;
    }),

  remove: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.db.ingredient.delete({ where: { id } });
      await seedMeilisearchIngredients(await meilisearchGetIngs(ctx.db));
    }),

  update: protectedProcedure
    .input(z.object({ ing: zIngredientCat, id: z.string().min(1) }))
    .mutation(async ({ ctx, input: { ing: data, id } }) => {
      const ing = await ctx.db.ingredient.update({
        where: { id },
        data,
        select: {
          name: true,
          id: true,
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          _count: { select: { recipe_ingredient: true } },
        },
      });
      await seedMeilisearchIngredients(await meilisearchGetIngs(ctx.db));
      const { _count, ...i } = ing;
      return { ...i, count: _count.recipe_ingredient };
    }),

  search: protectedProcedure
    .input(SearchSchema)
    .query(async ({ ctx, input: { search } }) => {
      const res = await ctx.ms.index("ingredients").search(search);
      const searchData = res.hits as MeilIngredient[];
      return searchData;
    }),

  categories: protectedProcedure.query(async ({ ctx }) => {
    const [categories, subcategories] = await Promise.all([
      ctx.db.category.findMany(),
      ctx.db.subcategory.findMany(),
    ]);
    return { categories, subcategories };
  }),
});
