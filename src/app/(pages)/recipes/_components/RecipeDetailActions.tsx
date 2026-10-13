"use client";

import { type ReactNode, useState } from "react";
import BackButton from "~/components/common/BackButton";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { copyRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import RecipeDropdownMenu from "./RecipeDropdownMenu";

type Props = {
  recipe: Recipe;
  deleteDescription?: ReactNode;
};

const RecipeDetailActions = ({ recipe, deleteDescription }: Props) => {
  const [pendingAction, setPendingAction] = useState<"copy" | null>(null);

  const runAction = async (
    actionName: NonNullable<typeof pendingAction>,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionName);
    try {
      await action();
    } finally {
      setPendingAction(null);
    }
  };

  if (!recipe.yours) {
    return (
      <>
        <BackButton />
        <Button
          type="button"
          disabled={pendingAction === "copy"}
          onClick={() => runAction("copy", () => copyRecipe({ id: recipe.id }))}
        >
          {pendingAction === "copy" && <Spinner className="mr-2" />}
          Kopiera recept
        </Button>
      </>
    );
  }

  return (
    <>
      <BackButton variant="ghost" size="icon" aria-label="Tillbaka">
        <Icon icon="ArrowLeft" />
      </BackButton>
      <RecipeDropdownMenu recipe={recipe} deleteDescription={deleteDescription} />
    </>
  );
};

export default RecipeDetailActions;
