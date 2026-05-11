"use client";
import { type ReactNode, useState } from "react";
import { cn, decimalToFraction } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import type { Item } from "~/server/shared";
import Comment from "./Comment";
import { type User } from "~/server/auth";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = {
  item: Item;
  children?: ReactNode;
  user: User;
};

const ItemComponent = ({
  item: {
    id,
    quantity,
    menu,
    unit,
    checked,
    comments,
    ingredient: { name },
  },
  children,
  user,
}: Props) => {
  const [showRecipe, setShowRecipe] = useState(false);
  const toggleItems = useShoppingItemsStore((state) => state.toggleItems);

  return (
    <li
      className={cn(
        "bg-c3 text-c5 flex flex-col rounded-md px-2 py-1 transition-opacity",
        checked && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            className="size-4 cursor-pointer"
            type="checkbox"
            checked={checked}
            onChange={(event) =>
              toggleItems([{ id, checked: event.currentTarget.checked, name }])
            }
          />
          <button
            disabled={!menu}
            onClick={() => setShowRecipe((p) => !p)}
            className="font-bold text-nowrap select-none first-letter:capitalize"
          >
            {name}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!checked && (
            <>
              <Comment comment={comments} item={{ id, name }} user={user} />
              {children}
            </>
          )}
          <div className="flex gap-2 select-none">
            <p>{decimalToFraction(quantity)}</p>
            <p>{unit}</p>
          </div>
        </div>
      </div>
      {menu && showRecipe && (
        <p className="grow overflow-hidden text-ellipsis whitespace-nowrap">
          {menu.recipe.name}
        </p>
      )}
    </li>
  );
};

export default ItemComponent;
