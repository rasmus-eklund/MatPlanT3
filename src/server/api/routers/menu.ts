import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAllContained } from "~/server/helpers/getAllContainedRecipes";
import { Day } from "types";
import { TRPCError } from "@trpc/server";
import { getRecipeById } from "~/server/helpers/getById";
import { zId, zPortionsId } from "~/zod/zodSchemas";
import { z } from "zod";
import days from "~/app/constants/days";
import scaleIngredients from "~/server/helpers/scaleIngredients";
import formatQuantityUnit from "~/server/helpers/formatQuantityUnit";

export const menuRouter = createTRPCRouter({
  addRecipe: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      const recipe = await getRecipeById(id);
      const allContained = await getAllContained(recipe);
      const ingredients = [...recipe.ingredients, ...allContained];
      await ctx.db.menu.create({
        data: {
          day: "Obestämd" as Day,
          portions: recipe.recipe.portions,
          userId,
          recipeId: id,
          shoppingListItem: {
            createMany: {
              data: ingredients.map(({ id, ...rest }) => ({
                checked: false,
                userId,
                ...rest,
              })),
            },
          },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const res = await ctx.db.menu.findMany({
      where: { userId },
      include: { recipe: { select: { name: true } } },
    });
    return res.map(({ recipe, ...rest }) => ({ name: recipe.name, ...rest }));
  }),

  changeDay: protectedProcedure
    .input(z.object({ id: z.string().min(1), day: z.enum(days) }))
    .mutation(({ ctx, input: { id, day } }) => {
      ctx.db.menu.update({ where: { id }, data: { day } });
    }),

  remove: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.db.menu.delete({ where: { id } });
    }),

  changePortions: protectedProcedure
    .input(zPortionsId)
    .mutation(async ({ ctx, input: { id, portions } }) => {
      ctx.db.$transaction(async (prisma) => {
        const res = await prisma.menu.findUnique({
          where: { id },
          include: {
            recipe: { select: { portions: true } },
            shoppingListItem: true,
          },
        });
        if (!res) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Menu item not found",
          });
        }
        const scale = portions / res.portions;
        const ings = formatQuantityUnit(res.shoppingListItem);
        const scaled = scaleIngredients(ings, scale);
        for (const ing of scaled) {
          await prisma.shoppingListItem.update({
            where: { id: ing.id },
            data: { quantity: ing.quantity },
          });
        }
        await prisma.menu.update({ where: { id }, data: { portions } });
      });
    }),
});
