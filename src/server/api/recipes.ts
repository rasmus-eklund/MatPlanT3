"use server";
import type {
  MeilRecipe,
  CreateRecipeInput,
  SearchRecipeParams,
} from "~/types";
import { authorize } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { db } from "../db";
import { notFound, redirect } from "next/navigation";
import { recipe, recipe_ingredient, recipe_recipe } from "../db/schema";
import { randomUUID } from "crypto";
import { searchRecipeSchema } from "~/zod/zodSchemas";
import { errorMessages } from "../errors";
import { add } from "../meilisearch/seedRecipes";

export const searchRecipes = async (params: SearchRecipeParams) => {
  const parsed = searchRecipeSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(errorMessages.INVALIDDATA);
  }
  const { page, search, shared } = parsed.data;
  const user = await authorize();
  const filter = shared
    ? `isPublic = true AND userId != ${user.id}`
    : `userId = ${user.id}`;

  const res = await msClient.index("recipes").search(search, {
    filter,
    limit: 10,
    offset: 10 * (page - 1),
    sort: !search ? ["name:asc"] : [],
  });
  const hits = res.hits as MeilRecipe[];
  return hits;
};

export const searchRecipeInsideRecipe = async (search: string) => {
  const user = await authorize();
  const res = await msClient
    .index("recipes")
    .search(search, { filter: `userId = ${user.id}` });
  return res.hits as MeilRecipe[];
};

export const addToMenu = async (id: string) => {
  console.log("added " + id);
};

export const getRecipeById = async (id: string) => {
  const found = await db.query.recipe.findFirst({
    where: (r, { eq }) => eq(r.id, id),
    columns: { userId: false },
    with: {
      contained: { with: { recipe: { columns: { name: true } } } },
      ingredients: { with: { ingredient: true } },
    },
  });
  if (!found) {
    notFound();
  }
  return {
    ...found,
    ingredients: found.ingredients.map(({ ingredient: { name }, ...i }) => ({
      name,
      ...i,
    })),
    contained: found.contained.map(({ recipe: { name }, ...i }) => ({
      ...i,
      name,
    })),
  };
};

export const createRecipe = async ({
  name,
  quantity,
  unit,
  instruction,
  isPublic,
  ingredients,
  contained,
}: CreateRecipeInput) => {
  const user = await authorize();
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(recipe).values({
      id,
      name,
      quantity,
      unit,
      instruction,
      isPublic,
      userId: user.id,
    });
    if (!!ingredients.length) {
      await tx
        .insert(recipe_ingredient)
        .values(ingredients.map((ing) => ({ ...ing, recipeId: id })));
    }
    if (!!contained.length) {
      await tx
        .insert(recipe_recipe)
        .values(contained.map((i) => ({ ...i, containerId: id })));
    }
  });

  const meilRecipe: MeilRecipe = {
    id,
    ingredients: ingredients.map(({ name }) => name),
    isPublic,
    name,
    userId: user.id,
  };
  await add(meilRecipe);
  redirect(`/recipes/${id}`);
};
