"use server";
import type {
  MeilRecipe,
  RecipeFormSubmit,
  SearchRecipeParams,
  SearchRecipesResult,
  UpdateRecipe,
} from "~/types";
import { type User } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { db } from "../db";
import {
  items,
  menu,
  recipe,
  recipe_group,
  recipe_ingredient,
  recipe_recipe,
} from "../db/schema";
import { alias } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { searchRecipeSchema } from "~/zod/zodSchemas";
import { errorMessages } from "../errors";
import { and, eq, inArray } from "drizzle-orm";
import { sideEffects } from "./sideEffects";
import { createCopy } from "~/server/recipes/recipeCopy";
import { getParentRecipes } from "~/server/recipes/recipeGraph";
import { assertNoCircularContainedRecipes } from "~/server/recipes/recipeValidation";
import { resyncRecipeMenuItems } from "~/server/recipes/menuSync";
import { bulkUpdateContainedRecipeQuantities } from "~/server/recipes/recipeRelations";

const parentRecipe = alias(recipe, "parentRecipe");

type SearchRecipeProps = { params: SearchRecipeParams };
export const searchRecipes = async ({ params }: SearchRecipeProps) => {
  const user = await sideEffects.authorize();
  const parsed = searchRecipeSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(errorMessages.INVALIDDATA);
  }
  const { limit, page, search, shared } = parsed.data;
  const filter = shared
    ? `isPublic = true AND userId != ${user.id}`
    : `userId = ${user.id}`;

  const res = await msClient.index("recipes").search(search, {
    filter,
    limit,
    offset: limit * (page - 1),
    sort: !search ? ["name:asc"] : [],
  });
  return {
    hits: res.hits as MeilRecipe[],
    total: res.estimatedTotalHits ?? res.hits.length,
  } satisfies SearchRecipesResult;
};

export const searchRecipeName = async (props: {
  search: string;
  excludeId?: string;
}) => {
  const user = await sideEffects.authorize();
  let filter = `userId = ${user.id}`;
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

export const getRecipeByIdForUser = async ({
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
    return sideEffects.notFound();
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

export const getRecipeById = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
  return await getRecipeByIdForUser({ id, user });
};

export const getRecipeDeleteParents = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
  const parents = await db
    .select({ id: parentRecipe.id, name: parentRecipe.name })
    .from(recipe_recipe)
    .innerJoin(parentRecipe, eq(recipe_recipe.containerId, parentRecipe.id))
    .innerJoin(recipe, eq(recipe_recipe.recipeId, recipe.id))
    .where(
      and(
        eq(recipe_recipe.recipeId, id),
        eq(recipe.userId, user.id),
        eq(parentRecipe.userId, user.id),
      ),
    );

  return parents;
};

export const createRecipe = async ({
  id: recipeId,
  name,
  quantity,
  unit,
  instruction,
  isPublic,
  groups,
  contained,
}: RecipeFormSubmit) => {
  const user = await sideEffects.authorize();
  await assertNoCircularContainedRecipes({ recipeId, contained, user });

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
  await sideEffects.addSearchDocument(meilRecipe);
  await sideEffects.addLog({
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
  sideEffects.redirect(`/recipes/${recipeId}`);
};

export const updateRecipe = async ({
  recipe: { instruction, isPublic, name, quantity, unit, id: recipeId },
  ingredients,
  contained,
  groups,
}: UpdateRecipe) => {
  const user = await sideEffects.authorize();
  await assertNoCircularContainedRecipes({
    recipeId,
    contained: [...contained.edited, ...contained.added],
    user,
  });

  const { returnIngredients, shouldResyncMenuItems } = await db.transaction(
    async (tx) => {
      const existingRecipe = await tx.query.recipe.findFirst({
        where: and(eq(recipe.id, recipeId), eq(recipe.userId, user.id)),
        columns: { quantity: true },
      });
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
          await tx
            .delete(recipe_ingredient)
            .where(eq(recipe_ingredient.id, id));
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
        await bulkUpdateContainedRecipeQuantities(tx, contained.edited);
      }
      if (!!contained.removed.length) {
        await tx
          .delete(recipe_recipe)
          .where(inArray(recipe_recipe.id, contained.removed));
      }
      if (!!contained.added.length) {
        await tx
          .insert(recipe_recipe)
          .values(
            contained.added.map((i) => ({ ...i, containerId: recipeId })),
          );
      }
      const returnIngredients = await tx.query.recipe_group.findMany({
        columns: {},
        where: (r, { eq }) => eq(r.recipeId, recipeId),
        with: {
          ingredients: { with: { ingredient: { columns: { name: true } } } },
        },
      });
      return {
        returnIngredients,
        shouldResyncMenuItems:
          existingRecipe?.quantity !== quantity ||
          !!ingredients.edited.length ||
          !!ingredients.removed.length ||
          !!ingredients.added.length ||
          !!contained.edited.length ||
          !!contained.removed.length ||
          !!contained.added.length,
      };
    },
  );

  if (shouldResyncMenuItems) {
    await resyncRecipeMenuItems({ recipeId, user });
  }
  await Promise.all([
    sideEffects.updateSearchDocument({
      id: recipeId,
      ingredients: returnIngredients.flatMap((group) =>
        group.ingredients.map((i) => i.ingredient.name),
      ),
      isPublic,
      name,
      quantity,
      unit,
      userId: user.id,
    }),
    sideEffects.addLog({
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
    }),
  ]);
  sideEffects.redirect(`/recipes/${recipeId}`);
};

export const removeRecipe = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
  const [deleted] = await db
    .delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, user.id)))
    .returning({ name: recipe.name });
  if (!deleted) {
    return sideEffects.notFound();
  }
  await Promise.all([
    sideEffects.removeSearchDocument(id),
    sideEffects.addLog({
      method: "delete",
      action: "removeRecipe",
      data: { name: deleted.name },
      userId: user.id,
    }),
  ]);
  sideEffects.redirect("/recipes");
};

export const copyRecipe = async ({ id }: { id: string }) => {
  const user = await sideEffects.authorize();
  const source = await db.query.recipe.findFirst({
    columns: { name: true },
    where: (r, { and, eq, or }) =>
      and(eq(r.id, id), or(eq(r.userId, user.id), eq(r.isPublic, true))),
  });
  if (!source) {
    return sideEffects.notFound();
  }
  const recipeId = await connectRecipe(id, user.id);
  await sideEffects.addLog({
    method: "create",
    action: "copyRecipe",
    data: { name: source.name },
    userId: user.id,
  });
  sideEffects.redirect(`/recipes/${recipeId}`);
};

const connectRecipe = async (
  childId: string,
  userId: string,
  parent?: { containerId: string; quantity: number },
) => {
  const child = await getRecipeByIdForUser({
    id: childId,
    user: { id: userId, admin: false },
  });
  const recipeId = randomUUID();
  const { newRecipe, newIngredients, newGroups } = createCopy(recipeId, child);
  await db.insert(recipe).values({ ...newRecipe, userId });
  await db.insert(recipe_group).values(newGroups);
  await db.insert(recipe_ingredient).values(newIngredients);
  await sideEffects.addSearchDocument({
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

export const nrOfRecipes = async () => {
  const user = await sideEffects.authorize();
  return await db.$count(recipe, eq(recipe.userId, user.id));
};
