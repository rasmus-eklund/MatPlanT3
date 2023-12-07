import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  getCount: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.db.user.count();
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.db.user.findMany({
      select: { email: true, _count: { select: { recipe: true } } },
    });
  }),
});
