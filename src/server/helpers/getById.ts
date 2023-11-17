import { TRPCError } from "@trpc/server";
import { Unit } from "types";
import { db } from "../db";

export const getRecipeById = async (id: string) => {
  try {
    const recipe = await db.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { include: { ingredient: { select: { name: true } } } },
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
      recipe: rest,
      contained: containers.map(
        ({ containedRecipe: { name }, ...contained }) => ({
          name,
          ...contained,
        }),
      ),
      ingredients: ingredients.map(
        ({ recipeId, quantity, unit, ingredient, ...rest }) => {
          return {
            ...rest,
            quantity: Number(quantity),
            unit: unit as Unit,
            name: ingredient.name,
          };
        },
      ),
    };
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Could not get recipe",
    });
  }
};
