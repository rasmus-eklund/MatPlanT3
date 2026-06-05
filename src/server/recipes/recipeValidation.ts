import "server-only";

import type { User } from "~/server/auth";
import { errorMessages } from "~/server/errors";
import { recipeContainsRecipe } from "./recipeGraph";

export const assertNoCircularContainedRecipes = async ({
  recipeId,
  contained,
  user,
}: {
  recipeId: string;
  contained: Array<{ recipeId: string }>;
  user: User;
}) => {
  for (const child of contained) {
    if (
      await recipeContainsRecipe({
        sourceId: child.recipeId,
        targetId: recipeId,
        user,
      })
    ) {
      throw new Error(errorMessages.CIRCULARREF);
    }
  }
};
