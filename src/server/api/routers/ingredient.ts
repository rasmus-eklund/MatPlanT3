import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { SearchSchema } from "~/zod/zodSchemas";
import { MeilIngredient } from "types";

export const ingredientRouter = createTRPCRouter({
  search: protectedProcedure
    .input(SearchSchema)
    .query(async ({ ctx, input: { search } }) => {
      const res = await ctx.ms.index("ingredients").search(search);
      const searchData = res.hits as MeilIngredient[];
      return searchData;
    }),
});
