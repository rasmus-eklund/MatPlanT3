import { revalidatePath as nextRevalidatePath } from "next/cache";
import { notFound as nextNotFound } from "next/navigation";
import { addLog } from "./auditLog";

export const menuSideEffects = {
  revalidatePath: (path: string) => nextRevalidatePath(path),
  notFound: (): never => nextNotFound(),
  addLog,
};
