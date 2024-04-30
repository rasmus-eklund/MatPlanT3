"use server";
import type {
  MeilRecipe,
  CreateRecipeInput,
  SearchRecipeParams,
  UpdateRecipe,
} from "~/types";
import { authorize } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { db } from "../db";
import { notFound, redirect } from "next/navigation";
import { recipe, recipe_ingredient, recipe_recipe } from "../db/schema";
import { randomUUID } from "crypto";
import { searchRecipeSchema } from "~/zod/zodSchemas";
import { errorMessages } from "../errors";
import { add, remove, update } from "../meilisearch/seedRecipes";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export const getRecipeById = async (id: string) => {
  const user = await authorize();
  const found = await db.query.recipe.findFirst({
    where: (r, { eq }) => eq(r.id, id),
    with: {
      contained: { with: { recipe: { columns: { name: true } } } },
      ingredients: {
        orderBy: (f, { asc }) => asc(f.order),
        with: { ingredient: true },
      },
    },
  });
  if (!found) {
    notFound();
  }
  const { userId, ingredients, contained, ...rec } = found;
  return {
    yours: userId === user.id,
    ...rec,
    ingredients: ingredients.map(({ ingredient: { name }, ...i }) => ({
      name,
      ...i,
    })),
    contained: contained.map(({ recipe: { name }, ...i }) => ({
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

export const updateRecipe = async ({
  recipe: { instruction, isPublic, name, quantity, unit, id: recipeId },
  editIngredients,
  removeIngredients,
  addIngredients,
  editContained,
  removeContained,
  addContained,
}: UpdateRecipe) => {
  const user = await authorize();
  const ingredients = await db.transaction(async (tx) => {
    await tx
      .update(recipe)
      .set({ name, quantity, unit, isPublic, instruction })
      .where(and(eq(recipe.id, recipeId), eq(recipe.userId, user.id)));
    if (!!editIngredients.length) {
      for (const {
        groupId,
        id,
        ingredientId,
        order,
        quantity,
        unit,
      } of editIngredients) {
        await tx
          .update(recipe_ingredient)
          .set({ groupId, ingredientId, order, quantity, unit })
          .where(eq(recipe_ingredient.id, id));
      }
    }
    if (!!removeIngredients.length) {
      for (const id of removeIngredients) {
        await tx.delete(recipe_ingredient).where(eq(recipe_ingredient.id, id));
      }
    }
    if (!!addIngredients.length) {
      await tx.insert(recipe_ingredient).values(addIngredients);
    }
    if (!!editContained.length) {
      for (const { id, quantity } of editContained) {
        await tx
          .update(recipe_recipe)
          .set({ quantity })
          .where(eq(recipe_recipe.id, id));
      }
    }
    if (!!removeContained.length) {
      for (const id of removeContained) {
        await tx.delete(recipe_recipe).where(eq(recipe_recipe.id, id));
      }
    }
    if (!!addContained.length) {
      await tx
        .insert(recipe_recipe)
        .values(addContained.map((i) => ({ ...i, containerId: recipeId })));
    }
    return await tx.query.recipe_ingredient.findMany({
      columns: {},
      where: (r, { eq }) => eq(r.recipeId, recipeId),
      with: { ingredient: { columns: { name: true } } },
    });
  });
  await update({
    id: recipeId,
    ingredients: ingredients.map((i) => i.ingredient.name),
    isPublic,
    name,
    userId: user.id,
  });
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
};

export const removeRecipe = async (id: string) => {
  const user = await authorize();
  await db
    .delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, user.id)));
  await remove(id);
  revalidatePath("/recipes");
  redirect("/recipes");
};
