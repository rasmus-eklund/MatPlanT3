import { revalidatePath as nextRevalidatePath } from "next/cache";
import {
  notFound as nextNotFound,
  redirect as nextRedirect,
} from "next/navigation";
import { authorize } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { add, remove, update } from "../meilisearch/seedRecipes";
import { addLog } from "./auditLog";
import type { MeilRecipe } from "~/types";

export const sideEffects = {
  revalidatePath: (path: string) => nextRevalidatePath(path),
  notFound: (): never => nextNotFound(),
  redirect: (url: string): never => nextRedirect(url),
  authorize,
  ingredientSearch: (search: string) =>
    msClient.index("ingredients").search(search),
  addSearchDocument: (recipe: MeilRecipe) => add(recipe),
  updateSearchDocument: (recipe: MeilRecipe) => update(recipe),
  removeSearchDocument: (id: string) => remove(id),
  addLog,
};
