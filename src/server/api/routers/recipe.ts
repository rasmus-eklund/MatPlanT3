import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, zSearchFilter } from "~/zod/zodSchemas";
import { z } from "zod";
import { getRecipeById } from "~/server/helpers/getById";
import { MeilRecipe } from "types";
import {
  meilisearchGetRecipes,
  seedMeilisearchRecipes,
} from "~/server/meilisearch/seedRecipes";

export const recipeRouter = createTRPCRouter({
  search: protectedProcedure
    .input(zSearchFilter)
    .query(async ({ ctx, input: { search } }) => {
      try {
        const res = await ctx.ms
          .index("recipes")
          .search(search, { filter: `userId = ${ctx.session.user.id}` });
        const hits = res.hits as MeilRecipe[];
        return hits;
      } catch (error) {
        try {
          const recipes = await ctx.db.recipe.findMany({
            where: {
              userId: ctx.session.user.id,
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                  ingredients: {
                    some: { name: { contains: search, mode: "insensitive" } },
                  },
                },
                { instruction: { contains: search, mode: "insensitive" } },
              ],
            },
            select: {
              name: true,
              id: true,
              portions: true,
            },
          });
          return recipes;
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not search recipe",
          });
        }
      }
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
      try {
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
        const recipes = await meilisearchGetRecipes(ctx.db);
        await seedMeilisearchRecipes(recipes);
        return data.id;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create recipe",
        });
      }
    },
  ),

  remove: protectedProcedure
    .input(zId)
    .mutation(async ({ ctx, input: { id } }) => {
      try {
        await ctx.db.recipe.delete({
          where: { id, userId: ctx.session.user.id },
        });
        const recipes = await meilisearchGetRecipes(ctx.db);
        await seedMeilisearchRecipes(recipes);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not remove recipe",
        });
      }
    }),

  update: protectedProcedure.input(zFullRecipe).mutation(
    async ({
      ctx,
      input: {
        recipe: { id, name, portions, instruction },
        ingredients,
        contained,
      },
    }) => {
      try {
        await ctx.db.recipe.update({
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
          await ctx.db.recipe_ingredient.upsert({
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
          await ctx.db.recipe_recipe.upsert({
            where: { id: uid },
            create: { containerRecipeId: id, portions, containedRecipeId },
            update: { portions },
          });
        }
        const recipes = await meilisearchGetRecipes(ctx.db);
        await seedMeilisearchRecipes(recipes);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not update recipe",
        });
      }
    },
  ),
});
