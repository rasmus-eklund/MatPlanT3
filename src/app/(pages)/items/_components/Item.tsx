"use client";
import { type ReactNode, useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { cn, decimalToFraction } from "~/lib/utils";
import type { Item } from "~/server/shared";
import Comment from "./Comment";
import { type User } from "~/server/auth";
import { debouncedCheckItems, debounceDuration } from "./utils";

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
  const [isChecked, setIsChecked] = useState(checked);
  const [showRecipe, setShowRecipe] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const check = () => {
    setIsChecked((p) => {
      debouncedCheckItems({ ids: [{ id, checked: !p, name }], user });
      return !p;
    });
  };

  return (
    <li
      className={cn(
        `bg-c3 text-c5 flex flex-col rounded-md px-2 py-1 transition-opacity`,
        isChecked && "opacity-50",
      )}
      style={{ transitionDuration: `${debounceDuration}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            className="size-4 cursor-pointer"
            type="checkbox"
            checked={isChecked}
            onChange={check}
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
