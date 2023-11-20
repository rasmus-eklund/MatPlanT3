"use client";
import { useState } from "react";
import { tItem } from "types";
import capitalize from "~/app/helpers/capitalize";
import { api } from "~/trpc/react";

type Props = {
  item: tItem;
};

const Item = ({
  item: { id, name, quantity, recipe, unit, checked },
}: Props) => {
  const [animate, setAnimate] = useState(checked);
  const utils = api.useUtils();
  const { mutate: check } = api.item.check.useMutation({
    onMutate: async ({ id, checked }) => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, (old) => {
        if (old) {
          return old.map((i) => (i.id === id ? { ...i, checked } : i));
        }
        return [];
      });
      return prevData;
    },
    onError: (err, updatedItem, ctx) => {
      utils.item.getAll.setData(undefined, ctx);
    },
    onSettled: () => {
      utils.item.getAll.invalidate();
    },
  });
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md bg-c3 px-2 py-1 text-c5 transition-all duration-300 ${
        animate && "opacity-50"
      } `}
    >
      <div className="flex gap-2">
        <input
          className="cursor-pointer"
          type="checkbox"
          checked={animate}
          onChange={() => {
            setAnimate((prev) => {
              setTimeout(() => {
                check({ id, checked: !prev });
              }, 300);
              return !prev;
            });
          }}
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
