import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { zId, zNameId, zStoreOrder } from "~/zod/zodSchemas";
import { createNewStore } from "../../helpers/createNewStore";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const storeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const stores = await ctx.db.store.findMany({
      where: { userId },
      select: {
        name: true,
        id: true,
        order: {
          select: {
            category: { select: { name: true, id: true } },
            subcategory: { select: { name: true, id: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    if (stores.length === 0) {
      const store = await createNewStore(
        ctx.session.user.id,
        ctx.db,
        "Ny affär",
      );
      return [store];
    }
    return stores;
  }),

  getById: protectedProcedure
    .input(zId)
    .query(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      const store = await ctx.db.store.findUnique({
        where: { id, userId },
        select: {
          name: true,
          id: true,
          order: {
            select: {
              category: { select: { name: true, id: true } },
              subcategory: { select: { name: true, id: true } },
            },
          },
        },
      });
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found.",
        });
      }
      return {
        name: store.name,
        id: store.id.toString(),
        order: store.order.map(({ category, subcategory }) => ({
          category: { ...category, id: category.id.toString() },
          subcategory: { ...subcategory, id: subcategory.id.toString() },
        })),
      };
    }),

  create: protectedProcedure.mutation(async ({ ctx }) =>
    createNewStore(ctx.session.user.id, ctx.db, "Ny affär"),
  ),

  remove: protectedProcedure.input(zId).mutation(({ ctx, input }) =>
    ctx.db.store.delete({
      where: { id: input.id, userId: ctx.session.user.id },
    }),
  ),

  rename: protectedProcedure
    .input(zNameId)
    .mutation(({ ctx, input: { name, id } }) =>
      ctx.db.store.update({ where: { id }, data: { name } }),
    ),

  updateOrder: protectedProcedure
    .input(z.object({ storeId: z.string().min(1), data: zStoreOrder }))
    .mutation(async ({ ctx, input: { storeId, data } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.store.update({
        where: { id: storeId, userId },
        data: {
          order: {
            deleteMany: { storeId },
            createMany: { data },
          },
        },
      });
    }),
});
