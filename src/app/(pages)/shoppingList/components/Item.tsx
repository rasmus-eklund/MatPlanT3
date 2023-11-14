"use client";

import { tItem } from "types";
import capitalize from "~/app/helpers/capitalize";
import { api } from "~/trpc/react";

type Props = {
  item: tItem;
  update: () => void;
};

const Item = ({ item, update }: Props) => {
  const { mutate: check } = api.item.check.useMutation({ onSuccess: update });
  const { id, name, quantity, recipe, unit, checked } = item;

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
          onChange={() => check({ id, checked: !checked })}
        />
        <p className="select-none font-bold">{capitalize(name)}</p>
      </div>
      {!!recipe && (
        <p className="grow overflow-hidden overflow-ellipsis whitespace-nowrap">
          {recipe}
        </p>
      )}
      <div className="flex select-none gap-2">
        <p>{quantity}</p>
        <p>{unit}</p>
      </div>
    </li>
  );
};

export default Item;
