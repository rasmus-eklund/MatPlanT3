"use client";
import { type ReactNode, useState } from "react";
import { Input } from "~/components/ui/input";
import { capitalize, decimalToFraction, delay } from "~/lib/utils";
import { checkItem } from "~/server/api/items";
import type { Item } from "~/server/shared";
import Comment from "./Comment";
import { toast } from "sonner";

type Props = {
  item: Item;
  children?: ReactNode;
};

const ItemComponent = ({
  item: {
    id,
    quantity,
    recipe_ingredient,
    unit,
    checked,
    comments,
    ingredient: { name },
  },
  children,
}: Props) => {
  const [animateCheck, setAnimateCheck] = useState(checked);
  const [showRecipe, setShowRecipe] = useState(false);

  const uncheck = () => {
    checkItem({ id, checked }).catch(() => toast.error("Kunde inte ändra"));
  };

  const check = async () => {
    setAnimateCheck((p) => !p);
    toast(`${capitalize(name)} ${checked ? "avmarkerad" : "markerad"}`, {
      action: {
        label: "Ångra",
        onClick: uncheck,
      },
    });
    await delay(300);
    await checkItem({ id, checked: !checked });
  };
  return (
    <li
      className={`bg-c3 text-c5 flex flex-col rounded-md px-2 py-1 transition-all duration-300 ${
        animateCheck && "opacity-50"
      } `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            className="size-4 cursor-pointer"
            type="checkbox"
            checked={animateCheck}
            onChange={check}
          />
          <button
            disabled={!recipe_ingredient}
            onClick={() => setShowRecipe((p) => !p)}
            className="font-bold text-nowrap select-none"
          >
            {capitalize(name)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!checked && (
            <>
              <Comment comment={comments} item={{ id, name }} />
              {children}
            </>
          )}
          <div className="flex gap-2 select-none">
            <p>{decimalToFraction(quantity)}</p>
            <p>{unit}</p>
          </div>
        </div>
      </div>
      {recipe_ingredient && showRecipe && (
        <p className="grow overflow-hidden text-ellipsis whitespace-nowrap">
          {recipe_ingredient.group.recipe.name}
        </p>
      )}
    </li>
  );
};

export default ItemComponent;
