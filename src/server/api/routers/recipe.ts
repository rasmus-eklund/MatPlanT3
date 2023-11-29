import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, SearchRecipeSchema } from "~/zod/zodSchemas";
import { z } from "zod";
import { getRecipeById } from "~/server/helpers/getById";
import { MeilRecipe } from "types";
import { add, remove, update } from "~/server/meilisearch/seedRecipes";
import { getAllContainedRecipes } from "~/server/helpers/getAllContainedRecipes";
import { redirect } from "next/navigation";

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
        recipe: { id: placeholder, ...recipe },
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
          id: data.id,
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
            isPublic,
            ingredients: { deleteMany: { recipeId: id } },
            containers: { deleteMany: { containerRecipeId: id } },
          },
        });
        await ctx.db.recipe_ingredient.createMany({
          data: ingredients.map(({ ingredientId, quantity, unit, order }) => ({
            ingredientId,
            quantity,
            recipeId: id,
            unit,
            order,
          })),
        });
        await ctx.db.recipe_recipe.createMany({
          data: contained.map(({ containedRecipeId, portions }) => ({
            containedRecipeId,
            containerRecipeId: id,
            portions,
          })),
        });
        await update({
          id,
          ingredients: ingredients.map(({ name }) => name),
          isPublic,
          name,
          portions,
          userId,
        });
      } catch {
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
      const recipes = [recipe, ...(await getAllContainedRecipes(recipe))];
      const newRecipes = await Promise.all(
        recipes.map(({ recipe: { id, isPublic, ...recipe }, ingredients }) =>
          db.recipe.create({
            data: {
              ...recipe,
              userId,
              ingredients: {
                createMany: {
                  data: ingredients.map(({ name, id, ...rest }) => rest),
                },
              },
            },
          }),
        ),
      );
      const newIds = newRecipes.map(({ id, name }) => ({ id, name }));
      const oldIds = recipes.map(({ recipe: { id, name } }) => ({ id, name }));
      const data = recipes.flatMap(({ contained }, index) =>
        contained.map(({ containedRecipeId, portions }) => ({
          containedRecipeId:
            newIds[oldIds.map(({ id }) => id).indexOf(containedRecipeId)]!.id,
          portions,
          containerRecipeId: newIds[index]!.id,
        })),
      );
      await db.recipe_recipe.createMany({ data });
      await Promise.all(
        recipes.map(({ recipe, ingredients }, index) =>
          add({
            ...recipe,
            id: newIds[index]!.id,
            isPublic: false,
            userId,
            ingredients: ingredients.map(({ name }) => name),
          }),
        ),
      );
      return { id: newRecipes[0]!.id };
    },
  ),
});
