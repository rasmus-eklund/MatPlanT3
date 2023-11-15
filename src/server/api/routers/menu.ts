import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAllContained } from "~/server/helpers/getAllContainedRecipes";
import { Day } from "types";
import { TRPCError } from "@trpc/server";
import { getRecipeById } from "~/server/helpers/getById";
import { zId, zPortionsId } from "~/zod/zodSchemas";
import { z } from "zod";
import days from "~/constants/days";
import scaleIngredients from "~/server/helpers/scaleIngredients";
import formatQuantityUnit from "~/server/helpers/formatQuantityUnit";
import { RouterOutputs } from "~/trpc/shared";

export const menuRouter = createTRPCRouter({
  addRecipe: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      const userId = ctx.session.user.id;
      const recipe = await getRecipeById(id);
      const allContained = await getAllContained(recipe);
      const ingredients = [
        ...recipe.ingredients.map((i) => ({
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

  getById: protectedProcedure
    .input(zId)
    .query(async ({ ctx, input: { id } }) => {
      const prisma = ctx.db;
      const menuItem = await prisma.menu.findUnique({
        where: { id },
        select: {
          shoppingListItem: true,
          recipeId: true,
          portions: true,
        },
      });
      if (!menuItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu item not found.",
        });
      }
      const recipes = await prisma.recipe.findMany({
        where: {
          id: { in: menuItem.shoppingListItem.map((i) => i.recipeId!) },
        },
        include: {
          containers: {
            select: {
              containerRecipe: { select: { name: true } },
              containedRecipe: { select: { name: true } },
              portions: true,
              containedRecipeId: true,
              containerRecipeId: true,
            },
          },
        },
      });
      const containers = recipes.flatMap((recipe) =>
        recipe.containers.map(
          ({ containedRecipe, containerRecipe, ...rest }) => ({
            ...rest,
            containedName: containedRecipe.name,
            containerName: containerRecipe.name,
          }),
        ),
      );
      const order: string[] = [menuItem.recipeId];
      const getOrder = (id: string) => {
        const items = containers.filter((i) => i.containerRecipeId === id);
        for (const item of items) {
          order.push(item.containedRecipeId);
          getOrder(item.containedRecipeId);
        }
      };
      getOrder(menuItem.recipeId);
      const orderedRecipes = recipes.map((recipe) => {
        const port = containers.find((i) => i.containedRecipeId === recipe.id);
        return {
          recipe: {
            ...recipe,
            portions: port ? port.portions : menuItem.portions,
          },
          ingredients: formatQuantityUnit(
            menuItem.shoppingListItem.filter(
              (item) => item.recipeId === recipe.id,
            ),
          ),
        };
      });
      orderedRecipes.sort(
        (a, b) => order.indexOf(a.recipe.id) - order.indexOf(b.recipe.id),
      );
      return orderedRecipes;
    }),
});
