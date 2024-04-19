"use server";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { db } from "../db";
import { items, menu, recipe, store, users } from "../db/schema";
import { getServerAuthSession } from "../auth";
import { count, eq } from "drizzle-orm";
import { removeMultiple } from "../meilisearch/seedRecipes";
import { revalidatePath } from "next/cache";

export const createAccount = async (user: KindeUser) => {
  await db.insert(users).values({ authId: user.id }).onConflictDoNothing();
};

export const getAllUsers = async () => {
  const user = await getServerAuthSession();
  if (!user?.admin) {
    throw new Error("UNAUTHORIZED");
  }
  const data = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      count: {
        recipe: count(recipe.id),
        store: count(store.id),
        menu: count(menu.id),
        items: count(items.id),
      },
    })
    .from(users)
    .leftJoin(recipe, eq(users.id, recipe.userId))
    .leftJoin(store, eq(users.id, store.userId))
    .leftJoin(menu, eq(users.id, menu.userId))
    .leftJoin(items, eq(users.id, items.userId))
    .groupBy(users.id);

  return data;
};
export type GetAllUsersReturnType = Awaited<ReturnType<typeof getAllUsers>>;

// getUserStats: protectedProcedure.query(async ({ ctx }) => {
//   const userId = ctx.session.user.id;
//   const [recipesOwn, recipesPublic, menuItems, shoppingListItems, stores] =
//     await Promise.all([
//       ctx.db.recipe.count({ where: { userId } }),
//       ctx.db.recipe.count({ where: { userId, isPublic: { equals: true } } }),
//       ctx.db.menu.count({ where: { userId } }),
//       ctx.db.shoppingListItem.count({ where: { userId } }),
//       ctx.db.store.count({ where: { userId } }),
//     ]);
//   return { recipesOwn, recipesPublic, menuItems, shoppingListItems, stores };
// }),

export const deleteUserById = async (id: string) => {
  const ids = await db
    .select({ id: recipe.id })
    .from(recipe)
    .where(eq(recipe.userId, id));

  await Promise.all([
    removeMultiple(ids.map(({ id }) => id)),
    db.delete(users).where(eq(users.id, id)),
  ]);
  revalidatePath("/admin/users");
};

// deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
//   const id = ctx.session.user.id;
//   const ids = await ctx.db.recipe.findMany({
//     where: { userId: id },
//     select: { id: true },
//   });
//   await Promise.all([
//     removeMultiple(ids.map(({ id }) => id)),
//     ctx.db.user.delete({ where: { id } }),
//   ]);
// }),

// editUserName: protectedProcedure
//   .input(zName)
//   .mutation(async ({ ctx, input: { name } }) => {
//     const id = ctx.session.user.id;
//     await ctx.db.user.update({ where: { id }, data: { name } });
//   }),
