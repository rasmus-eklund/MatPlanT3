import { ensureError, getAllContained } from "~/lib/utils";
import { authorize } from "../auth";
import { getRecipeById } from "./recipes";
import { db } from "../db";
import { items, menu } from "../db/schema";
import { randomUUID } from "crypto";
import { errorMessages } from "../errors";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getMenu = async () => {
  const user = await authorize();
  return await db.query.menu.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
    with: { recipe: { columns: { name: true } } },
  });
};

export const addToMenu = async (id: string) => {
  const user = await authorize();
  const recipe = await getRecipeById(id);
  try {
    const allContained = await getAllContained(recipe, [id]);
    const ingredients = [
      ...recipe.ingredients.map((i) => ({
        ...i,
        recipeId: recipe.id,
      })),
      ...allContained,
    ];
    await db.transaction(async (tx) => {
      const id = randomUUID();
      await tx.insert(menu).values({
        id,
        quantity: recipe.quantity,
        recipeId: recipe.id,
        userId: user.id,
      });
      await tx.insert(items).values(
        ingredients.map(({ ingredientId, quantity, unit, recipeId }) => ({
          ingredientId,
          quantity,
          unit,
          userId: user.id,
          recipeId,
          menuId: id,
        })),
      );
    });
  } catch (err) {
    const error = ensureError(err);
    if (error.message === errorMessages.CIRCULARREF) {
      throw new Error(errorMessages.CIRCULARREF);
    }
    throw new Error(errorMessages.FAILEDINSERT);
  }
  revalidatePath("/menu");
};

export const removeMenuItem = async (id: string) => {
  const user = await authorize();
  await db.delete(menu).where(and(eq(menu.id, id), eq(menu.userId, user.id)));
  revalidatePath("/menu");
};
