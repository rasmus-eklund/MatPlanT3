"use server";
import type { MeilRecipe, SearchRecipeParams } from "~/types";
import { authorize } from "../auth";
import msClient from "../meilisearch/meilisearchClient";

export const searchRecipes = async ({
  page,
  search,
  shared,
}: SearchRecipeParams) => {
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

export const addToMenu = async (id: string) => {
  console.log("added " + id);
};
