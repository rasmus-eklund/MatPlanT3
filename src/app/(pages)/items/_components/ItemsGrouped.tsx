"use client";

import { useState } from "react";
import Icon from "~/icons/Icon";
import ItemComponent from "./Item";
import { capitalize, decimalToFraction, delay } from "~/lib/utils";
import { groupByUnit } from "./utils";
import type { ItemsGrouped } from "~/types";
import { checkItems, toggleHome, updateItem } from "~/server/api/items";
import { Input } from "~/components/ui/input";
import EditItem from "~/components/common/EditItem";
import EditItemHome from "~/components/common/EditItemHome";

type Props = { group: ItemsGrouped };
const ItemsGroupedComponent = ({ group: { name, checked, group, home, ingredientId } }: Props) => {
  const [animate, setAnimate] = useState(checked);
  const [open, setOpen] = useState(false);

  if (group.length === 1 && group[0]) {
    const item = group[0];
    return (
      <ItemComponent item={item}>
        <EditItemHome
          home={item.home}
          onHome={async (home) =>
            await toggleHome({ home, ids: [item.ingredientId] })
          }
        />
        {item.recipe_ingredient ? null : (
          <EditItem
            item={{ ...item, name: item.ingredient.name }}
            onUpdate={updateItem}
          />
        )}
      </ItemComponent>
    );
  }
  const onCheck = async () => {
    setAnimate(!checked);
    await delay(300);
    await checkItems({
      ids: group.map(({ id }) => id),
      checked: !checked,
    });
  };
  return (
    <li
      className={`flex flex-col gap-1 rounded-md bg-c5 transition-opacity duration-200 ${
        animate && "opacity-50"
      }`}
      key={name}
    >
      <div className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1">
        <Input
          className="size-4 cursor-pointer"
          type="checkbox"
          name="checkGroup"
          checked={animate}
          id={`check-group-${name}`}
          onChange={onCheck}
        />
        <p className="grow font-bold text-c5">{capitalize(name)}</p>
        <EditItemHome
          home={home}
          onHome={async (home) =>
            await toggleHome({ home, ids: [ingredientId] })
          }
        />
        <ul className="flex gap-1">
          {groupByUnit(group).map((i, index, arr) => (
            <li className="flex select-none gap-1 text-c5" key={i.unit}>
              <p>{decimalToFraction(i.quantity)}</p>
              <p>{i.unit}</p>
              {index < arr.length - 1 && <span>, </span>}
            </li>
          ))}
        </ul>
        <button className="cursor-pointer" onClick={() => setOpen(!open)}>
          <Icon className="size-5 fill-c5" icon={open ? "up" : "down"} />
        </button>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 rounded-b-md pl-4">
          {group.map((item) => (
            <ItemComponent key={item.id} item={item}>
              {item.recipe_ingredient ? null : (
                <EditItem
                  item={{ ...item, name: item.ingredient.name }}
                  onUpdate={updateItem}
                />
              )}
            </ItemComponent>
          ))}
        </ul>
      )}
    </li>
  );
};

export default ItemsGroupedComponent;
