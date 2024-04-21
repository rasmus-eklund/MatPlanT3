"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "../auth";
import { db } from "../db";
import { store } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { createNewStore } from "~/lib/utils/createNewStore";
import { type tName } from "~/zod/zodSchemas";

export const getAllStores = async () => {
  const user = await authorize();
  const stores = await db
    .select({ id: store.id, name: store.name })
    .from(store)
    .where(eq(store.userId, user.id));
  return stores;
};

//   getById: protectedProcedure
//     .input(zId)
//     .query(async ({ ctx, input: { id } }) => {
//       const userId = ctx.session.user.id;
//       const store = await ctx.db.store.findUnique({
//         where: { id, userId },
//         select: {
//           name: true,
//           id: true,
//           order: {
//             select: {
//               category: { select: { name: true, id: true } },
//               subcategory: { select: { name: true, id: true } },
//             },
//           },
//         },
//       });
//       if (!store) {
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "Store not found.",
//         });
//       }
//       return {
//         name: store.name,
//         id: store.id.toString(),
//         order: store.order.map(({ category, subcategory }) => ({
//           category: { ...category, id: category.id.toString() },
//           subcategory: { ...subcategory, id: subcategory.id.toString() },
//         })),
//       };
//     }),

export const addStore = async ({ name }: tName) => {
  const user = await authorize();
  await createNewStore({ userId: user.id, name });
  revalidatePath("/stores");
};

export const deleteStore = async (id: string) => {
  const user = await authorize();
  await db
    .delete(store)
    .where(and(eq(store.id, id), eq(store.userId, user.id)));
  revalidatePath("/stores");
};

//   rename: protectedProcedure
//     .input(zNameId)
//     .mutation(({ ctx, input: { name, id } }) =>
//       ctx.db.store.update({ where: { id }, data: { name } }),
//     ),

//   updateOrder: protectedProcedure
//     .input(z.object({ storeId: z.string().min(1), data: zStoreOrder }))
//     .mutation(async ({ ctx, input: { storeId, data } }) => {
//       const userId = ctx.session.user.id;
//       await ctx.db.store.update({
//         where: { id: storeId, userId },
//         data: {
//           order: {
//             deleteMany: { storeId },
//             createMany: { data },
//           },
//         },
//       });
//     }),
// });
