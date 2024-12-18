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
    toast(`${name} ${checked ? "avmarkerad" : "markerad"}`, {
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
      className={`relative flex items-center justify-between gap-2 rounded-md bg-c3 px-2 py-1 text-c5 transition-all duration-300 ${
        animateCheck && "opacity-50"
      } `}
    >
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
          className="select-none text-nowrap font-bold"
        >
          {capitalize(name)}
        </button>
      </div>
      {recipe_ingredient && showRecipe && (
        <p className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
          {recipe_ingredient.recipe.name}
        </p>
      )}
      <div className="flex items-center gap-2">
        {!checked && (
          <>
            <Comment comment={comments} item={{ id, name }} />
            {children}
          </>
        )}
        <div className="flex select-none gap-2">
          <p>{decimalToFraction(quantity)}</p>
          <p>{unit}</p>
        </div>
      </div>
    </li>
  );
};

export default ItemComponent;
