import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { zFullRecipe, zId, SearchRecipeSchema } from "~/zod/zodSchemas";
import { z } from "zod";
import { getRecipeById } from "~/server/helpers/getById";
import { MeilRecipe } from "types";
import { add, remove, update } from "~/server/meilisearch/seedRecipes";
import { getAllContainedRecipes } from "~/server/helpers/getAllContainedRecipes";

export const recipeRouter = createTRPCRouter({
  search: protectedProcedure
    .input(SearchRecipeSchema)
    .query(async ({ ctx, input: { search, page, shared: sharedString } }) => {
      const shared = sharedString === "true";
      const userId = ctx.session.user.id;
      const filter = shared
        ? `isPublic = true AND userId != ${userId}`
        : `userId = ${userId}`;
      const res = await ctx.ms.index("recipes").search(search, {
        filter,
        limit: 10,
        offset: 10 * (page - 1),
        sort: !search ? ["name:asc"] : [],
      });
      const hits = res.hits as MeilRecipe[];
      return hits;
    }),

  searchRecipeInsideRecipe: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ ctx, input: { search } }) => {
      const userId = ctx.session.user.id;
      const res = await ctx.db.recipe.findMany({
        where: { userId, name: { contains: search, mode: "insensitive" } },
        select: { id: true, name: true, portions: true },
      });
      return res.map(({ id, ...i }) => ({ containedRecipeId: id, ...i }));
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
          },
        });
        await ctx.db.recipe_recipe.createMany({
          data: contained.map(({ containedRecipeId, portions }) => ({
            containedRecipeId,
            containerRecipeId: data.id,
            portions,
          })),
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
      const recipes = [recipe, ...(await getAllContainedRecipes(recipe, [id]))];
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
