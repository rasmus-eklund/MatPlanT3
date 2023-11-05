import { zId } from "~/zod/zodSchemas";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const homeRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({ ingredientId: z.string().min(1) }))
    .mutation(async ({ ctx, input: { ingredientId } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.home.create({ data: { ingredientId, userId } });
    }),

  remove: protectedProcedure
    .input(z.object({ ingredientId: z.string().min(1) }))
    .mutation(async ({ ctx, input: { ingredientId } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.home.delete({
        where: { userId_ingredientId: { userId, ingredientId } },
      });
    }),
});
