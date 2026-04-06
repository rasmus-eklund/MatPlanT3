import { revalidatePath as nextRevalidatePath } from "next/cache";
import { authorize } from "../auth";
import msClient from "../meilisearch/meilisearchClient";
import { addLog } from "./auditLog";

export const itemsSideEffects = {
  revalidatePath: (path: string) => nextRevalidatePath(path),
  authorize,
  ingredientSearch: (search: string) =>
    msClient.index("ingredients").search(search),
  addLog,
};
