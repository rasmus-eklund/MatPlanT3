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
import {
  recipe,
  recipe_group,
  recipe_ingredient,
  recipe_recipe,
} from "../db/schema";
import { randomUUID } from "crypto";
import { searchRecipeSchema } from "~/zod/zodSchemas";
import { errorMessages } from "../errors";
import { add, remove, update } from "../meilisearch/seedRecipes";
import { and, eq } from "drizzle-orm";
import { create_copy } from "~/lib/utils";

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

export const searchRecipeInsideRecipe = async (
  search: string,
  parentId: string,
) => {
  const user = await authorize();
  const recipes = await db.query.recipe.findMany({
    where: (r, { ilike, and, eq, not }) =>
      and(
        ilike(r.name, `%${search}%`),
        eq(r.userId, user.id),
        not(eq(r.id, parentId)),
      ),
    columns: { id: true, name: true, unit: true },
  });
  return recipes;
};

export const getRecipeById = async (id: string) => {
  const user = await authorize();
  const found = await db.query.recipe.findFirst({
    where: (r, { eq }) => eq(r.id, id),
    with: {
      contained: { with: { recipe: { columns: { name: true, unit: true } } } },
      ingredients: {
        orderBy: (f, { asc }) => asc(f.order),
        with: { ingredient: true, group: true },
      },
      groups: true,
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
    contained: contained.map(({ recipe: { name, unit }, ...i }) => ({
      ...i,
      name,
      unit,
    })),
  };
};

export const createRecipe = async ({
  id: recipeId,
  name,
  quantity,
  unit,
  instruction,
  isPublic,
  ingredients,
  groups,
  contained,
}: CreateRecipeInput) => {
  const user = await authorize();
  await db.transaction(async (tx) => {
    await tx.insert(recipe).values({
      id: recipeId,
      name,
      quantity,
      unit,
      instruction,
      isPublic,
      userId: user.id,
    });
    if (!!groups.length) {
      await tx.insert(recipe_group).values(groups);
    }
    if (!!ingredients.length) {
      await tx.insert(recipe_ingredient).values(ingredients);
    }
    if (!!contained.length) {
      await tx
        .insert(recipe_recipe)
        .values(contained.map((i) => ({ ...i, containerId: recipeId })));
    }
  });

  const meilRecipe: MeilRecipe = {
    id: recipeId,
    ingredients: ingredients.map(({ name }) => name),
    isPublic,
    name,
    userId: user.id,
  };
  await add(meilRecipe);
  redirect(`/recipes/${recipeId}`);
};

export const updateRecipe = async ({
  recipe: { instruction, isPublic, name, quantity, unit, id: recipeId },
  ingredients,
  contained,
  groups,
}: UpdateRecipe) => {
  const user = await authorize();
  const returnIngredients = await db.transaction(async (tx) => {
    await tx
      .update(recipe)
      .set({ name, quantity, unit, isPublic, instruction })
      .where(and(eq(recipe.id, recipeId), eq(recipe.userId, user.id)));
    if (!!groups.added.length) {
      await tx.insert(recipe_group).values(groups.added);
    }
    if (!!groups.edited.length) {
      for (const { name, order, id } of groups.edited) {
        await tx
          .update(recipe_group)
          .set({ name, order })
          .where(eq(recipe_group.id, id));
      }
    }
    if (!!groups.removed.length) {
      for (const id of groups.removed) {
        await tx.delete(recipe_group).where(eq(recipe_group.id, id));
      }
    }
    if (!!ingredients.edited.length) {
      for (const {
        groupId,
        id,
        ingredientId,
        order,
        quantity,
        unit,
      } of ingredients.edited) {
        await tx
          .update(recipe_ingredient)
          .set({ groupId, ingredientId, order, quantity, unit })
          .where(eq(recipe_ingredient.id, id));
      }
    }
    if (!!ingredients.removed.length) {
      for (const id of ingredients.removed) {
        await tx.delete(recipe_ingredient).where(eq(recipe_ingredient.id, id));
      }
    }
    if (!!ingredients.added.length) {
      await tx.insert(recipe_ingredient).values(ingredients.added);
    }
    if (!!contained.edited.length) {
      for (const { id, quantity } of contained.edited) {
        await tx
          .update(recipe_recipe)
          .set({ quantity })
          .where(eq(recipe_recipe.id, id));
      }
    }
    if (!!contained.removed.length) {
      for (const id of contained.removed) {
        await tx.delete(recipe_recipe).where(eq(recipe_recipe.id, id));
      }
    }
    if (!!contained.added.length) {
      await tx
        .insert(recipe_recipe)
        .values(contained.added.map((i) => ({ ...i, containerId: recipeId })));
    }
    return await tx.query.recipe_ingredient.findMany({
      columns: {},
      where: (r, { eq }) => eq(r.recipeId, recipeId),
      with: { ingredient: { columns: { name: true } } },
    });
  });
  await update({
    id: recipeId,
    ingredients: returnIngredients.map((i) => i.ingredient.name),
    isPublic,
    name,
    userId: user.id,
  });
  redirect(`/recipes/${recipeId}`);
};

export const removeRecipe = async (id: string) => {
  const user = await authorize();
  await db
    .delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, user.id)));
  await remove(id);
  redirect("/recipes");
};

export const copyRecipe = async (id: string) => {
  const user = await authorize();
  const recipeId = await connectRecipe(id, user.id);
  redirect(`/recipes/${recipeId}`);
};

const connectRecipe = async (
  childId: string,
  userId: string,
  parent?: { containerId: string; quantity: number },
) => {
  const child = await getRecipeById(childId);
  const recipeId = randomUUID();
  const { newRecipe, newIngredients, newGroups } = create_copy(recipeId, child);
  await db.insert(recipe).values({ ...newRecipe, userId });
  await db.insert(recipe_group).values(newGroups);
  await db.insert(recipe_ingredient).values(newIngredients);
  await add({
    id: recipeId,
    ingredients: newIngredients.map((i) => i.name),
    isPublic: false,
    name: newRecipe.name,
    userId,
  });
  if (parent) {
    await db.insert(recipe_recipe).values({ ...parent, recipeId });
  }
  if (!!child.contained.length) {
    for (const contained of child.contained) {
      await connectRecipe(contained.recipeId, userId, {
        containerId: recipeId,
        quantity: contained.quantity,
      });
    }
  }
  return recipeId;
};
