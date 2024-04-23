"use client";
import { useState } from "react";
import { capitalize } from "~/lib/utils";
import { checkItem } from "~/server/api/items";
import type { Item } from "~/server/shared";

type Props = {
  item: Item;
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
}: Props) => {
  const [showRecipe, setShowRecipe] = useState(false);
  const check = async () => {
    await checkItem({ id, checked: !checked });
  };
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md bg-c3 px-2 py-1 text-c5 transition-all duration-300 ${
        checked && "opacity-50"
      } `}
    >
      <div className="flex gap-2">
        <input
          className="cursor-pointer"
          type="checkbox"
          checked={checked}
          onChange={check}
        />
        <button
          disabled={!recipe}
          onClick={() => setShowRecipe((p) => !p)}
          className="select-none font-bold"
        >
          {capitalize(name)}
        </button>
      </div>
      {recipe && showRecipe && (
        <p className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
          {recipe.name}
        </p>
      )}
      <div className="flex select-none gap-2">
        <p>{quantity}</p>
        <p>{unit}</p>
      </div>
    </li>
  );
};

export default ItemComponent;
