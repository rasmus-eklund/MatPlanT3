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
  const [pendingAction, setPendingAction] = useState<"add" | "copy" | "delete" | null>(null);
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
      <DropdownMenu>
        <DropdownMenuTrigger render={<Icon className="size-5" icon="Ellipsis" />} />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Button
                nativeButton={false}
                variant="ghost"
                className="justify-start"
                disabled={pendingAction === "add"}
                onClick={() => runAction("add", () => addToMenu({ id: recipe.id }))}
                render={
                  <span>
                    {pendingAction === "add" ? <Spinner /> : <Icon icon="MenuSquare" />}
                    <p>Lägg till meny</p>
                  </span>
                }
              />
            }
          />

          <DropdownMenuItem
            render={
              <Button
                variant="ghost"
                className="justify-start"
                nativeButton={false}
                render={
                  <Link href={`/recipes/${recipe.id}/edit`}>
                    <Icon icon="Pencil" />
                    <span>Redigera</span>
                  </Link>
                }
              />
            }
          />

          {recipe.isPublic && (
            <DropdownMenuItem
              render={
                <Button
                  variant="ghost"
                  nativeButton={false}
                  onClick={() => copyLinkToRecipe(recipe.id)}
                  render={
                    <span>
                      <Icon icon="HandHelping" />
                      <p className="ml-auto">Kopiera länk</p>
                    </span>
                  }
                />
              }
            />
          )}

          <DropdownMenuItem
            render={
              <Button
                variant="ghost"
                type="button"
                disabled={pendingAction === "delete"}
                onClick={() => setDeleteOpen(true)}
                className="justify-start"
                nativeButton={false}
                render={
                  <span>
                    <Icon icon="Trash" />
                    <p>Ta bort</p>
                  </span>
                }
              />
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

export default RecipeDetailActions;
