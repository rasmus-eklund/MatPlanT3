import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getAllContained,
  getAllContainedRecipesRescaled,
} from "~/server/helpers/getAllContainedRecipes";
import { Day } from "types";
import { TRPCError } from "@trpc/server";
import { getRecipeById } from "~/server/helpers/getById";
import { zId, zPortionsId } from "~/zod/zodSchemas";
import { z } from "zod";
import days from "~/constants/days";
import scaleIngredients from "~/server/helpers/scaleIngredients";
import formatQuantityUnit from "~/server/helpers/formatQuantityUnit";
import ensureError from "~/server/helpers/ensureError";

export const menuRouter = createTRPCRouter({
  addRecipe: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      const recipe = await getRecipeById(id);
      try {
        const allContained = await getAllContained(recipe, [id]);
        const ingredients = [
          ...recipe.ingredients.map(({ order, group, ...i }) => ({
            ...i,
            recipeId: recipe.recipe.id,
          })),
          ...allContained,
        ];
        await ctx.db.menu.create({
          data: {
            day: "Obestämd" as Day,
            portions: recipe.recipe.portions,
            userId,
            recipeId: id,
            shoppingListItem: {
              createMany: {
                data: ingredients.map(({ id, name, ...rest }) => ({
                  checked: false,
                  userId,
                  ...rest,
                })),
              },
            },
          },
        });
      } catch (err) {
        const error = ensureError(err);
        if (error.message === "circular") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Förbjuden cirkulär referens.",
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Något gick fel.",
        });
      }
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
    .mutation(async ({ ctx, input: { id, day } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.menu.update({ where: { id, userId }, data: { day } });
    }),

  remove: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      await ctx.db.menu.delete({ where: { id, userId } });
    }),

  changePortions: protectedProcedure
    .input(zPortionsId)
    .mutation(async ({ ctx, input: { id, portions } }) => {
      const userId = ctx.session.user.id;
      const res = await ctx.db.menu.findUnique({
        where: { id, userId },
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
      await Promise.all(
        scaled.map((ing) =>
          ctx.db.shoppingListItem.update({
            where: { id: ing.id },
            data: { quantity: ing.quantity },
          }),
        ),
      );
      await ctx.db.menu.update({ where: { id, userId }, data: { portions } });
    }),

  getById: protectedProcedure
    .input(zId)
    .query(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      const menuItem = await ctx.db.menu.findUnique({
        where: { id, userId },
        select: { recipeId: true, portions: true },
      });
      if (!menuItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu item not found.",
        });
      }
      const recipe = await getRecipeById(menuItem.recipeId);
      const scale = menuItem.portions / recipe.recipe.portions;
      recipe.ingredients = scaleIngredients(recipe.ingredients, scale);
      recipe.recipe.portions *= scale;
      const recipes = await getAllContainedRecipesRescaled(recipe, scale, [
        recipe.recipe.id,
      ]);
      return [recipe, ...recipes];
    }),
});
