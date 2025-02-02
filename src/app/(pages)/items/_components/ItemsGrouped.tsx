"use client";

import { useState } from "react";
import Icon from "~/icons/Icon";
import ItemComponent from "./Item";
import { capitalize, decimalToFraction, delay } from "~/lib/utils";
import type { ItemsGrouped } from "~/types";
import { checkItems, toggleHome, updateItem } from "~/server/api/items";
import { Input } from "~/components/ui/input";
import EditItem from "~/components/common/EditItem";
import EditItemHome from "~/components/common/EditItemHome";

type Props = { group: ItemsGrouped };
const ItemsGroupedComponent = ({
  group: { name, checked, group, home, ingredientId },
}: Props) => {
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

  const unitItem = group.every((i) => i.unit === group[0]?.unit)
    ? {
        quantity: group.reduce((acc, item) => acc + item.quantity, 0),
        unit: group[0]!.unit,
      }
    : null;
  return (
    <li
      className={`bg-c5 flex flex-col gap-1 rounded-md transition-opacity duration-200 ${
        animate && "opacity-50"
      }`}
      key={name}
    >
      <div className="bg-c3 flex items-center gap-2 rounded-md px-2 py-1">
        <Input
          className="size-4 cursor-pointer"
          type="checkbox"
          name="checkGroup"
          checked={animate}
          id={`check-group-${name}`}
          onChange={onCheck}
        />
        <p className="text-c5 grow font-bold">{capitalize(name)}</p>
        <EditItemHome
          home={home}
          onHome={async (home) =>
            await toggleHome({ home, ids: [ingredientId] })
          }
        />
        {unitItem ? (
          <div className="text-c5 flex gap-1 select-none">
            <p>{decimalToFraction(unitItem.quantity)}</p>
            <p>{unitItem.unit}</p>
          </div>
        ) : null}
        <button className="cursor-pointer" onClick={() => setOpen(!open)}>
          <Icon className="fill-c5 size-5" icon={open ? "up" : "down"} />
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
