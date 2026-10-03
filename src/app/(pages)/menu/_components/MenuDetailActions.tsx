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
        <DropdownMenuTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Icon icon="Ellipsis" />
                </Button>
              }
            />
          }
        />
        <DropdownMenuContent align="end">
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
            render={
              <Link href={`/recipes/${recipe.id}/edit`} className="flex items-center gap-2">
                <Icon icon="Pencil" />
                <span>Redigera</span>
              </Link>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default MenuDetailActions;
