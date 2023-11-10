import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, zSearchFilter } from "~/zod/zodSchemas";
import { z } from "zod";
import { getRecipeById } from "~/server/helpers/getById";

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
          portions: true,
        },
      });
      return recipes;
    }),

  getById: protectedProcedure
    .input(z.string().min(1))
    .query(async ({ input: id }) => {
      return await getRecipeById(id);
    }),

  create: protectedProcedure.input(zFullRecipe).mutation(
    async ({
      ctx,
      input: {
        recipe: { id, ...recipe },
        ingredients,
        contained,
      },
    }) => {
      const data = await ctx.db.recipe.create({
        data: {
          ...recipe,
          userId: ctx.session.user.id,
          ingredients: {
            createMany: {
              data: ingredients.map(({ id, ...rest }) => rest),
            },
          },
          containers: {
            createMany: {
              data: contained.map(({ id: containedRecipeId, portions }) => ({
                containedRecipeId,
                portions,
              })),
            },
          },
        },
      });
      return data.id;
    },
  ),

  remove: protectedProcedure.input(zId).mutation(({ ctx, input: { id } }) =>
    ctx.db.recipe.delete({
      where: { id, userId: ctx.session.user.id },
    }),
  ),

  update: protectedProcedure.input(zFullRecipe).mutation(
    async ({
      ctx,
      input: {
        recipe: { id, name, portions, instruction },
        ingredients,
        contained,
      },
    }) => {
      await ctx.db.$transaction(async (prisma) => {
        try {
          await prisma.recipe.update({
            where: { id },
            data: {
              name,
              portions,
              instruction,
              containers: {
                deleteMany: { id: { notIn: contained.map((i) => i.id) } },
              },
              ingredients: {
                deleteMany: { id: { notIn: ingredients.map((i) => i.id) } },
              },
            },
          });
          for (const { id: uid, ...rest } of ingredients) {
            await prisma.recipe_ingredient.upsert({
              where: { id: uid },
              create: { recipeId: id, ...rest },
              update: { ...rest },
            });
          }
          for (const {
            id: uid,
            portions,
            containedRecipeId,
            name,
          } of contained) {
            await prisma.recipe_recipe.upsert({
              where: { id: uid },
              create: { containerRecipeId: id, portions, containedRecipeId },
              update: { portions },
            });
          }
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not update recipe",
          });
        }
      });
    },
  ),
});
