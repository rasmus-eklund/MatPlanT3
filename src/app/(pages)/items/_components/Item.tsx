"use client";
import { type ReactNode, useState } from "react";
import { Input } from "~/components/ui/input";
import { capitalize, delay } from "~/lib/utils";
import { checkItem } from "~/server/api/items";
import type { Item } from "~/server/shared";

type Props = {
  item: Item;
  children?: ReactNode;
};

const ItemComponent = ({
  item: {
    id,
    quantity,
    recipe,
    unit,
    checked,
    ingredient: { name },
  },
  children,
}: Props) => {
  const [animateCheck, setAnimateCheck] = useState(checked);
  const [showRecipe, setShowRecipe] = useState(false);
  const check = async () => {
    setAnimateCheck((p) => !p);
    await delay(300);
    await checkItem({ id, checked: !checked });
  };
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md bg-c3 px-2 py-1 text-c5 transition-all duration-300 ${
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
          disabled={!recipe}
          onClick={() => setShowRecipe((p) => !p)}
          className="select-none text-nowrap font-bold"
        >
          {capitalize(name)}
        </button>
      </div>
      {recipe && showRecipe && (
        <p className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
          {recipe.name}
        </p>
      )}
      <div className="flex items-center gap-2">
        {!checked && children}
        <div className="flex select-none gap-2">
          <p>{quantity}</p>
          <p>{unit}</p>
        </div>
      </div>
    </li>
  );
};

export default ItemComponent;
