"use client";

import { useState } from "react";
import Icon from "~/components/common/Icon";
import ItemComponent from "./Item";
import { cn, decimalToFraction } from "~/lib/utils";
import type { ItemsGrouped } from "~/types";
import { searchItem, toggleHome, updateItem } from "~/server/api/items";
import { Input } from "~/components/ui/input";
import EditItemHome from "~/components/common/EditItemHome";
import SearchModal from "~/components/common/SearchModal";
import { type User } from "~/server/auth";
import { debouncedCheckItems } from "./utils";

type Props = { group: ItemsGrouped; user: User };
const ItemsGroupedComponent = ({
  group: { name, checked, group, home, ingredientId },
  user,
}: Props) => {
  const [animate, setAnimate] = useState(checked);
  const [open, setOpen] = useState(false);

  if (group.length === 1 && group[0]) {
    const item = group[0];
    return (
      <ItemComponent item={item} user={user}>
        <EditItemHome
          home={item.home}
          onHome={async (home) =>
            await toggleHome({ home, ids: [item.ingredientId], user })
          }
        />
        {item.recipe_ingredient ? null : (
          <SearchModal
            user={user}
            title="vara"
            onSearch={searchItem}
            item={{
              id: ingredientId,
              name,
              quantity: item.quantity,
              unit: item.unit,
            }}
            onSubmit={async (i) => {
              await updateItem({
                item: {
                  ingredientId: i.id,
                  quantity: i.quantity,
                  unit: i.unit,
                  id: item.id,
                },
                user,
              });
            }}
          />
        )}
      </ItemComponent>
    );
  }
  const onCheck = () => {
    setAnimate((p) => !p);
    debouncedCheckItems({
      ids: group.map(({ id }) => ({ id, checked: !animate, user })),
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
      className={cn(
        "bg-c5 flex flex-col gap-1 rounded-md transition-opacity duration-200",
        animate && "opacity-50",
      )}
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
        <p className="text-c5 grow font-bold select-none first-letter:capitalize">
          {name}
        </p>
        <EditItemHome
          home={home}
          onHome={async (home) =>
            await toggleHome({ home, ids: [ingredientId], user })
          }
        />
        {unitItem ? (
          <div className="text-c5 flex gap-1 select-none">
            <p>{decimalToFraction(unitItem.quantity)}</p>
            <p>{unitItem.unit}</p>
          </div>
        ) : null}
        <button onClick={() => setOpen(!open)}>
          <Icon className="text-c5" icon={open ? "ChevronUp" : "ChevronDown"} />
        </button>
      </div>
      {open && (
        <ul className="flex flex-col gap-1 rounded-b-md pl-4">
          {group.map((item) => (
            <ItemComponent key={item.id} item={item} user={user}>
              {item.recipe_ingredient ? null : (
                <SearchModal
                  user={user}
                  title="vara"
                  onSearch={searchItem}
                  item={{
                    id: ingredientId,
                    name,
                    quantity: item.quantity,
                    unit: item.unit,
                  }}
                  onSubmit={async (i) => {
                    await updateItem({
                      item: {
                        ingredientId: i.id,
                        quantity: i.quantity,
                        unit: i.unit,
                        id: item.id,
                      },
                      user,
                    });
                  }}
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
