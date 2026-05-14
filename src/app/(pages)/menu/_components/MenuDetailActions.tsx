"use client";

import Link from "next/link";
import BackButton from "~/components/common/BackButton";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { copyLinkToRecipe } from "~/lib/utils";
import { type Recipe } from "~/server/shared";

type Props = {
  recipe: Pick<Recipe, "id" | "isPublic">;
  back?: boolean;
};

const MenuDetailActions = ({ recipe, back = true }: Props) => {
  return (
    <>
      {back && (
        <BackButton variant="ghost" size="icon" aria-label="Tillbaka">
          <Icon icon="ArrowLeft" />
        </BackButton>
      )}
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
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="flex items-center gap-2"
            >
              <Icon icon="Pencil" />
              <span>Redigera</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default MenuDetailActions;
