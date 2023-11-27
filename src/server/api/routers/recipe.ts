import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, SearchRecipeSchema } from "~/zod/zodSchemas";
import { z } from "zod";
import { getRecipeById } from "~/server/helpers/getById";
import { MeilRecipe } from "types";
import { add, remove, update } from "~/server/meilisearch/seedRecipes";
import { getAllContained } from "~/server/helpers/getAllContainedRecipes";

export const recipeRouter = createTRPCRouter({
  search: protectedProcedure
    .input(SearchRecipeSchema)
    .query(async ({ ctx, input: { search, shared } }) => {
      const userId = ctx.session.user.id;
      try {
        if (shared === "true") {
          const res = await ctx.ms.index("recipes").search(search, {
            filter: `isPublic = true AND userId != ${userId}`,
          });
          const hits = res.hits as MeilRecipe[];
          return hits;
        }
        const res = await ctx.ms
          .index("recipes")
          .search(search, { filter: `userId = ${userId}` });
        const hits = res.hits as MeilRecipe[];
        return hits;
      } catch (error) {
        console.log({ error });
        try {
          if (shared === "true") {
            const recipes = await ctx.db.recipe.findMany({
              where: {
                userId: { not: userId },
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  {
                    ingredients: {
                      some: {
                        ingredient: {
                          name: { contains: search, mode: "insensitive" },
                        },
                      },
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
          }
          const recipes = await ctx.db.recipe.findMany({
            where: {
              userId,
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                  ingredients: {
                    some: {
                      ingredient: {
                        name: { contains: search, mode: "insensitive" },
                      },
                    },
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

  getById: protectedProcedure.input(z.string().min(1)).query(
    async ({
      ctx: {
        session: {
          user: { id: userId },
        },
      },
      input: id,
    }) => {
      const res = await getRecipeById(id);
      const { recipe, ...rest } = res;
      const { userId: recipeUserId, ...restOfRecipe } = recipe;
      return { yours: recipeUserId === userId, ...rest, recipe: restOfRecipe };
    },
  ),

  create: protectedProcedure.input(zFullRecipe).mutation(
    async ({
      ctx,
      input: {
        recipe: { id, ...recipe },
        ingredients,
        contained,
      },
    }) => {
      const userId = ctx.session.user.id;
      try {
        const data = await ctx.db.recipe.create({
          data: {
            ...recipe,
            userId,
            ingredients: {
              createMany: {
                data: ingredients.map(({ id, name, ...rest }) => rest),
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
        await add({
          id,
          ...recipe,
          ingredients: ingredients.map(({ name }) => name),
          userId,
        });
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
        await remove(id);
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
        recipe: { id, name, portions, instruction, isPublic },
        ingredients,
        contained,
      },
    }) => {
      const userId = ctx.session.user.id;
      try {
        await ctx.db.recipe.update({
          where: { id, userId },
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
        for (const { id: uid, name, ...rest } of ingredients) {
          await ctx.db.recipe_ingredient.upsert({
            where: { id: uid },
            create: { recipeId: id, ...rest },
            update: { ...rest },
          });
        }
        for (const { id: uid, portions, containedRecipeId } of contained) {
          await ctx.db.recipe_recipe.upsert({
            where: { id: uid },
            create: { containerRecipeId: id, portions, containedRecipeId },
            update: { portions },
          });
        }
        await update({
          id,
          ingredients: ingredients.map(({ name }) => name),
          isPublic,
          name,
          portions,
          userId,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not update recipe",
        });
      }
    },
  ),
  copy: protectedProcedure.input(zId).mutation(
    async ({
      ctx: {
        db,
        session: {
          user: { id: userId },
        },
      },
      input: { id },
    }) => {
      const recipe = await getRecipeById(id);
      const all = await getAllContained(recipe);
      const allIds = [...new Set(all.map(({ recipeId }) => recipeId))];
      const recipes = [
        recipe,
        ...(await Promise.all(allIds.map((id) => getRecipeById(id)))),
      ];
      console.log({ recipes: recipes.map(({ recipe: { name } }) => name) });
      // for (const {
      //   ingredients,
      //   recipe: { instruction, name, portions },
      // } of recipes) {
      //   const rec = await db.recipe.create({
      //     data: {
      //       userId,
      //       instruction,
      //       name,
      //       portions,
      //       ingredients: {
      //         createMany: {
      //           data: ingredients.map(({ id, name, ...rest }) => ({
      //             ...rest,
      //           })),
      //         },
      //       },
      //     },
      //   });
      //   await add({ ...rec, ingredients: ingredients.map(({ name }) => name) });
      // }
    },
  ),
});
