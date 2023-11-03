import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, zSearchFilter } from "~/zod/zodSchemas";
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
          portions: true,
        },
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
              id: true,
              containedRecipeId: true,
              portions: true,
              containedRecipe: {
                select: { name: true },
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
      const { ingredients, containers, userId, ...rest } = recipe;
      return {
        ...rest,
        contained: containers.map(
          ({ containedRecipe: { name }, ...contained }) => ({
            name,
            ...contained,
          }),
        ),
        ingredients: ingredients.map(
          ({ recipeId, quantity, unit, ...rest }) => {
            return {
              ...rest,
              quantity: Number(quantity),
              unit: unit as Unit,
            };
          },
        ),
      };
    }),

  create: protectedProcedure
    .input(zFullRecipe)
    .mutation(async ({ ctx, input: { recipe, ingredients, contained } }) => {
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
          recipe: {
            recipe: { name, portions, instruction },
            ingredients,
            contained,
          },
          id,
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
              console.log(name, portions);
              await prisma.recipe_recipe.upsert({
                where: { id: uid },
                create: { containerRecipeId: id, portions, containedRecipeId },
                update: { portions },
              });
            }
          } catch (error) {
            console.log(error);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not update recipe",
            });
          }
        });
      },
    ),
});
