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

type Props = {
  recipeId: string;
  back?: boolean;
};

const MenuDetailActions = ({ recipeId, back = true }: Props) => {
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
          <DropdownMenuItem asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2"
              onClick={() => copyLinkToRecipe(recipeId)}
            >
              <Icon icon="HandHelping" />
              <span>Kopiera länk</span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/recipes/${recipeId}/edit`}
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
