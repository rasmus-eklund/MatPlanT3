"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import BackButton from "~/components/common/BackButton";
import Icon from "~/components/common/Icon";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { addToMenu } from "~/server/api/menu";
import { copyRecipe, removeRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import { copyLinkToRecipe } from "~/lib/utils";

type Props = {
  recipe: Pick<Recipe, "id" | "name" | "isPublic" | "yours">;
  deleteDescription?: ReactNode;
};

const RecipeDetailActions = ({ recipe, deleteDescription }: Props) => {
  const [pendingAction, setPendingAction] = useState<
    "add" | "copy" | "delete" | null
  >(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
          onClick={() =>
            runAction("copy", () =>
              copyRecipe({ id: recipe.id, name: recipe.name }),
            )
          }
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Åtgärder"
          >
            <Icon icon="Ellipsis" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 hover:cursor-pointer"
              disabled={pendingAction === "add"}
              onClick={() =>
                runAction("add", () => addToMenu({ id: recipe.id }))
              }
            >
              {pendingAction === "add" ? (
                <Spinner />
              ) : (
                <Icon icon="MenuSquare" />
              )}
              <span>Lägg till meny</span>
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="flex items-center gap-2 hover:cursor-pointer"
            >
              <Icon icon="Pencil" />
              <span>Redigera</span>
            </Link>
          </DropdownMenuItem>

          {recipe.isPublic && (
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 hover:cursor-pointer"
                onClick={() => copyLinkToRecipe(recipe.id)}
              >
                <Icon icon="HandHelping" />
                <span>Kopiera länk</span>
              </button>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 hover:cursor-pointer"
              disabled={pendingAction === "delete"}
              onClick={() => setDeleteOpen(true)}
            >
              <Icon icon="Trash" />
              <span>Ta bort</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ta bort recept</DialogTitle>
            <DialogDescription>
              {deleteDescription ?? "Detta kommer att ta bort receptet."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between md:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Avbryt
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pendingAction === "delete"}
              onClick={() =>
                runAction("delete", () =>
                  removeRecipe({ id: recipe.id, name: recipe.name }),
                )
              }
            >
              {pendingAction === "delete" && <Spinner className="mr-2" />}
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipeDetailActions;
