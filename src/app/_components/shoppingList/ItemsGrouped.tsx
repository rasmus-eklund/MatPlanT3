import { useState } from "react";
import Item from "./Item";

import { tItemsGrouped } from "types";
import {
  groupByUnit,
  sortByChecked,
} from "~/app/helpers/sortByCheckedSubcategory";
import capitalize from "~/app/helpers/capitalize";
import Icon from "../icons/Icon";
import { api } from "~/trpc/react";
import IconStyle from "../icons/standardIconStyle";

type Props = {
  group: tItemsGrouped;
  update: () => void;
};

const ItemsGrouped = ({ group, update }: Props) => {
  const { mutate: check } = api.item.checkMultiple.useMutation({
    onSuccess: update,
  });
  const [open, setOpen] = useState(false);
  return group.group.length === 1 ? (
    <Item item={group.group[0]!} update={update} />
  ) : (
    <li
      className={`flex flex-col gap-1 rounded-md bg-c5 transition-opacity duration-200 ${
        group.checked && "opacity-50"
      }`}
      key={group.name}
    >
      <div className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1">
        <input
          className="cursor-pointer"
          type="checkbox"
          name="checkGroup"
          checked={group.checked}
          id={`check-group-${group.name}`}
          onChange={() =>
            check({
              ids: group.group.map(({ id }) => ({ id })),
              checked: !group.checked,
            })
          }
        />
        <p className="grow font-bold text-c5">{capitalize(group.name)}</p>
        <ul className="flex gap-1">
          {groupByUnit(group.group).map((i, index, arr) => (
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
          {sortByChecked(group.group).map((item) => (
            <Item key={item.id} item={item} update={update} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default ItemsGrouped;
