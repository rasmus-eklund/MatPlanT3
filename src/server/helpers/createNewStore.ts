import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export const createNewStore = async (
  userId: string,
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  name: string,
) => {
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      subcategory: { select: { id: true, name: true } },
    },
  });
  const data = categories.flatMap((cat) =>
    cat.subcategory.map((sub) => ({
      categoryId: cat.id,
      subcategoryId: sub.id,
    })),
  );
  const store = await db.store.create({
    data: {
      name,
      userId,
      order: { createMany: { data } },
    },
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
  return store;
};
