import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, zRecipe, zSearchFilter } from "~/zod/zodSchemas";
import { z } from "zod";
import { Unit } from "types";

export const recipeRouter = createTRPCRouter({
  search: protectedProcedure
    .input(zSearchFilter)
    .query(async ({ ctx, input: { search } }) => {
      const recipes = await ctx.db.recipe.findMany({
        where: {
          userId: ctx.session.user.id,
          name: { contains: search, mode: "insensitive" },
        },
        select: {
          name: true,
          id: true,
        },
        orderBy: { name: "asc" },
      });

      return recipes;
    }),

  getById: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input: id }) => {
      const recipe = await ctx.db.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          containers: {
            select: {
              containedRecipe: {
                select: { name: true, id: true, portions: true },
              },
            },
          },
        },
      });
      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found.",
        });
      }
      const { ingredients, containers, userId: _, ...rest } = recipe;
      return {
        ...rest,
        contained: containers.map(({ containedRecipe }) => containedRecipe),
        ingredients: ingredients.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unit: i.unit as Unit,
        })),
      };
    }),

  create: protectedProcedure
    .input(zFullRecipe)
    .mutation(async ({ ctx, input: { recipe, ingredients } }) => {
      const data = await ctx.db.recipe.create({
        data: {
          ...recipe,
          userId: ctx.session.user.id,
          ingredients: {
            createMany: {
              data: ingredients.map((i) => {
                const { id, ...rest } = i;
                return { ingredientId: id, ...rest };
              }),
            },
          },
        },
      });
      return data.id;
    }),

  remove: protectedProcedure.input(zId).mutation(({ ctx, input: { id } }) =>
    ctx.db.recipe.delete({
      where: { id, userId: ctx.session.user.id },
    }),
  ),

  update: protectedProcedure
    .input(z.object({ recipe: zFullRecipe, id: z.string().min(1) }))
    .mutation(
      async ({
        ctx,
        input: {
          recipe: { recipe, ingredients },
          id,
        },
      }) => {
        await ctx.db.$transaction(async (prisma) => {
          try {
            await prisma.recipe_ingredient.deleteMany({
              where: { ingredientId: { notIn: ingredients.map((i) => i.id) } },
            });
            for (let ingredient of ingredients) {
              await prisma.recipe_ingredient.upsert({where: {id}});
            }
          } catch (error) {}
        });
        const data = await ctx.db.recipe.update({
          where: { id },
          data: {
            ...recipe,
            ingredients: {
              deleteMany: {
                ingredientId: { notIn: ingredients.map((i) => i.id) },
              },
              updateMany: {
                data: ingredients.map(({ id: ingredientId, ...rest }) => ({
                  ingredientId,
                  ...rest,
                })),
              },
            },
          },
        });
        return data.id;
      },
    ),
});
