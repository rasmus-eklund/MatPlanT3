"use server";
import type {
  MeilRecipe,
  RecipeFormSubmit,
  SearchRecipeParams,
  UpdateRecipe,
} from "~/types";
import { type User } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { db } from "../db";
import { notFound, redirect } from "next/navigation";
import {
  items,
  menu,
  recipe,
  recipe_group,
  recipe_ingredient,
  recipe_recipe,
} from "../db/schema";
import { randomUUID } from "crypto";
import { searchRecipeSchema } from "~/zod/zodSchemas";
import { errorMessages } from "../errors";
import { add, remove, update } from "../meilisearch/seedRecipes";
import { and, eq, inArray } from "drizzle-orm";
import { create_copy, getParentRecipes } from "~/lib/utils";
import { addLog } from "./auditLog";

type SearchRecipeProps = { params: SearchRecipeParams; user: User };
export const searchRecipes = async ({ params, user }: SearchRecipeProps) => {
  const parsed = searchRecipeSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(errorMessages.INVALIDDATA);
  }
  const { page, search, shared } = parsed.data;
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

export const searchRecipeName = async (props: {
  search: string;
  excludeId?: string;
  user: User;
}) => {
  let filter = `userId = ${props.user.id}`;
  if (props.excludeId) {
    filter += ` AND id != ${props.excludeId}`;
  }
  const res = await msClient.index("recipes").search(props.search, {
    filter,
  });
  return (res.hits as MeilRecipe[]).map((i) => ({
    id: i.id,
    name: i.name,
    unit: i.unit,
    quantity: i.quantity,
  }));
};

export const getRecipeById = async ({
  id,
  user,
}: {
  id: string;
  user: User;
}) => {
  const found = await db.query.recipe.findFirst({
    where: (r, { eq }) => eq(r.id, id),
    with: {
      contained: { with: { recipe: { columns: { name: true, unit: true } } } },
      groups: {
        orderBy: (g, { asc }) => asc(g.order),
        with: {
          ingredients: {
            orderBy: (i, { asc }) => asc(i.order),
            with: { ingredient: { columns: { name: true } } },
          },
        },
      },
    },
  });
  if (!found) {
    notFound();
  }
  const { userId, contained, ...rec } = found;
  return {
    yours: userId === user.id,
    ...rec,
    contained: contained.map(({ recipe: { name, unit }, ...i }) => ({
      ...i,
      name,
      unit,
    })),
  };
};

export const createRecipe = async ({
  user,
  id: recipeId,
  name,
  quantity,
  unit,
  instruction,
  isPublic,
  groups,
  contained,
}: RecipeFormSubmit & { user: User }) => {
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
    const ingredients = groups.flatMap((g) => g.ingredients);
    if (ingredients.length) {
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
    ingredients: groups
      .flatMap((g) => g.ingredients)
      .map(({ ingredient: { name } }) => name),
    isPublic,
    name,
    quantity,
    unit,
    userId: user.id,
  };
  await add(meilRecipe);
  addLog({
    method: "create",
    action: "createRecipe",
    data: {
      name,
      quantity,
      unit,
      instruction,
      isPublic,
      groups: groups.map((g) => ({
        name: g.name,
        ingredients: g.ingredients.map((i) => i.ingredient.name),
      })),
      contained: contained.length,
    },
    userId: user.id,
  });
  redirect(`/recipes/${recipeId}`);
};

export const updateRecipe = async ({
  user,
  recipe: { instruction, isPublic, name, quantity, unit, id: recipeId },
  ingredients,
  contained,
  groups,
}: UpdateRecipe & { user: User }) => {
  const returnIngredients = await db.transaction(async (tx) => {
    await tx
      .update(recipe)
      .set({ name, quantity, unit, isPublic, instruction })
      .where(and(eq(recipe.id, recipeId), eq(recipe.userId, user.id)));
    if (!!groups.added.length) {
      await tx
        .insert(recipe_group)
        .values(groups.added.map((g) => ({ ...g, recipeId })));
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
        await tx
          .update(items)
          .set({ quantity, unit, ingredientId })
          .where(eq(items.recipeIngredientId, id));
      }
    }
    if (!!ingredients.removed.length) {
      for (const id of ingredients.removed) {
        await tx.delete(recipe_ingredient).where(eq(recipe_ingredient.id, id));
        await tx.delete(items).where(eq(items.recipeIngredientId, id));
      }
    }
    if (!!ingredients.added.length) {
      const newIds = await tx
        .insert(recipe_ingredient)
        .values(ingredients.added)
        .returning({ id: recipe_ingredient.id });
      const parentIds = await getParentRecipes(recipeId);
      const menus = await tx.query.menu.findMany({
        where: inArray(menu.recipeId, [recipeId, ...parentIds]),
      });
      if (!!menus.length) {
        const menuIds = menus.map((menu) => menu.id);
        for (const menuId of menuIds) {
          await tx.insert(items).values(
            ingredients.added.map(({ ingredientId, quantity, unit }, i) => ({
              quantity,
              unit,
              userId: user.id,
              ingredientId,
              menuId,
              recipeIngredientId: newIds[i]!.id,
            })),
          );
        }
      }
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
    return await tx.query.recipe_group.findMany({
      columns: {},
      where: (r, { eq }) => eq(r.recipeId, recipeId),
      with: {
        ingredients: { with: { ingredient: { columns: { name: true } } } },
      },
    });
  });
  await update({
    id: recipeId,
    ingredients: returnIngredients.flatMap((group) =>
      group.ingredients.map((i) => i.ingredient.name),
    ),
    isPublic,
    name,
    quantity,
    unit,
    userId: user.id,
  });
  addLog({
    method: "update",
    action: "updateRecipe",
    data: {
      name,
      quantity,
      unit,
      instruction,
      isPublic,
      ingredients: {
        added: ingredients.added.length,
        removed: ingredients.removed.length,
        edited: ingredients.edited.length,
      },
      contained: {
        added: contained.added.length,
        removed: contained.removed.length,
        edited: contained.edited.length,
      },
      groups: {
        added: groups.added.length,
        removed: groups.removed.length,
        edited: groups.edited.length,
      },
    },
    userId: user.id,
  });
  redirect(`/recipes/${recipeId}`);
};

export const removeRecipe = async ({
  id,
  user,
  name,
}: {
  id: string;
  user: User;
  name: string;
}) => {
  await db
    .delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, user.id)));
  await remove(id);
  addLog({
    method: "delete",
    action: "removeRecipe",
    data: { name },
    userId: user.id,
  });
  redirect("/recipes");
};

export const copyRecipe = async ({
  id,
  user,
  name,
}: {
  id: string;
  user: User;
  name: string;
}) => {
  const recipeId = await connectRecipe(id, user.id);
  addLog({
    method: "create",
    action: "copyRecipe",
    data: { name },
    userId: user.id,
  });
  redirect(`/recipes/${recipeId}`);
};

const connectRecipe = async (
  childId: string,
  userId: string,
  parent?: { containerId: string; quantity: number },
) => {
  const child = await getRecipeById({
    id: childId,
    user: { id: userId, admin: false },
  });
  const recipeId = randomUUID();
  const { newRecipe, newIngredients, newGroups } = create_copy(recipeId, child);
  await db.insert(recipe).values({ ...newRecipe, userId });
  await db.insert(recipe_group).values(newGroups);
  await db.insert(recipe_ingredient).values(newIngredients);
  await add({
    id: recipeId,
    ingredients: newIngredients.map((i) => i.ingredient.name),
    isPublic: false,
    name: newRecipe.name,
    quantity: newRecipe.quantity,
    unit: newRecipe.unit,
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

export const getParentRecipe = async (recipeId: string) =>
  await db.query.recipe_recipe.findMany({
    where: eq(recipe_recipe.recipeId, recipeId),
  });
