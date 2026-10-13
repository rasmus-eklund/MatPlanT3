"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
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
import { removeRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import { copyIngredientsFromRecipe, copyLinkToRecipe } from "~/lib/utils";

type Props = {
  recipe: Recipe;
  deleteDescription?: ReactNode;
  hideEdit?: boolean;
};

const RecipeDropdownMenu = ({ recipe, deleteDescription, hideEdit = false }: Props) => {
  const [pendingAction, setPendingAction] = useState<"add" | "delete" | null>(null);
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="ghost" size="icon" aria-label="Fler alternativ">
              <Icon icon="Ellipsis" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={pendingAction === "add"}
            onClick={() => runAction("add", () => addToMenu({ id: recipe.id }))}
            render={
              <span className="flex gap-2">
                {pendingAction === "add" ? <Spinner /> : <Icon icon="MenuSquare" />}
                <p className="text-nowrap">Lägg till meny</p>
              </span>
            }
          />

          {!hideEdit && (
            <DropdownMenuItem
              render={
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Icon icon="Pencil" />
                  <span>Redigera</span>
                </Link>
              }
            />
          )}

          {recipe.isPublic && (
            <DropdownMenuItem
              onClick={() => copyLinkToRecipe(recipe.id)}
              render={
                <span>
                  <Icon icon="HandHelping" />
                  <p>Kopiera länk</p>
                </span>
              }
            />
          )}

          <DropdownMenuItem
            disabled={pendingAction === "delete"}
            onClick={() => setDeleteOpen(true)}
            render={
              <span>
                <Icon icon="Trash" />
                <p>Ta bort</p>
              </span>
            }
          />
          <DropdownMenuItem
            onClick={() => copyIngredientsFromRecipe(recipe)}
            render={
              <span className="flex gap-2">
                <Icon icon="Copy" />
                <span>Kopiera ingredienser</span>
              </span>
            }
          />
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
            <DialogClose
              render={
                <Button type="button" variant="secondary">
                  Avbryt
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              disabled={pendingAction === "delete"}
              onClick={() => runAction("delete", () => removeRecipe({ id: recipe.id }))}
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

export default RecipeDropdownMenu;
