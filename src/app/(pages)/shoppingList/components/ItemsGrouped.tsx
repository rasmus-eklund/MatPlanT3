import { useState } from "react";
import Item from "./Item";

import { tItemsGrouped } from "types";
import {
  groupByUnit,
  sortByChecked,
} from "~/app/helpers/sortAndGroup";
import capitalize from "~/app/helpers/capitalize";
import Icon from "~/icons/Icon";
import { api } from "~/trpc/react";
import IconStyle from "../../../../icons/standardIconStyle";

type Props = {
  group: tItemsGrouped;
};

const ItemsGrouped = ({ group: { checked, name, group } }: Props) => {
  const [animate, setAnimate] = useState(checked);
  const utils = api.useUtils();
  const { mutate: check } = api.item.checkMultiple.useMutation({
    onMutate: async ({ ids, checked }) => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, (old) => {
        if (old) {
          return old.map((i) =>
            ids.some(({ id }) => i.id === id) ? { ...i, checked } : i,
          );
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
  const [open, setOpen] = useState(false);
  return group.length === 1 ? (
    <Item item={group[0]!} />
  ) : (
    <li
      className={`flex flex-col gap-1 rounded-md bg-c5 transition-opacity duration-200 ${
        animate && "opacity-50"
      }`}
      key={name}
    >
      <div className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1">
        <input
          className="cursor-pointer"
          type="checkbox"
          name="checkGroup"
          checked={animate}
          id={`check-group-${name}`}
          onChange={() => {
            {
              setAnimate((prev) => {
                setTimeout(() => {
                  check({
                    ids: group.map(({ id }) => ({ id })),
                    checked: !prev,
                  });
                }, 300);
                return !prev;
              });
            }
          }}
        />
        <p className="grow font-bold text-c5">{capitalize(name)}</p>
        <ul className="flex gap-1">
          {groupByUnit(group).map((i, index, arr) => (
            <li className="flex select-none gap-1 text-c5" key={i.unit}>
              <p>{i.quantity}</p>
              <p>{i.unit}</p>
              {index < arr.length - 1 && <span>, </span>}
            </li>
          ))}
        </ul>
        <button className="cursor-pointer" onClick={() => setOpen(!open)}>
          <Icon className={IconStyle} icon={open ? "up" : "down"} />
        </button>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 rounded-b-md pl-4">
          {sortByChecked(group).map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default ItemsGrouped;
