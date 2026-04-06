import {
  notFound as nextNotFound,
  redirect as nextRedirect,
} from "next/navigation";
import { add, remove, update } from "../meilisearch/seedRecipes";
import { addLog } from "./auditLog";
import type { MeilRecipe } from "~/types";

export const recipeSideEffects = {
  notFound: (): never => nextNotFound(),
  redirect: (url: string): never => nextRedirect(url),
  addSearchDocument: (recipe: MeilRecipe) => add(recipe),
  updateSearchDocument: (recipe: MeilRecipe) => update(recipe),
  removeSearchDocument: (id: string) => remove(id),
  addLog,
};
