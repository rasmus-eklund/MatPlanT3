"use client";

import { useState } from "react";
import Icon from "~/components/common/Icon";
import ItemComponent from "./Item";
import { cn, decimalToFraction } from "~/lib/utils";
import type { ItemsGrouped } from "~/types";
import { searchItem } from "~/server/api/items";
import { Input } from "~/components/ui/input";
import EditItemHome from "~/components/common/EditItemHome";
import SearchModal from "~/components/common/SearchModal";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = { group: ItemsGrouped };
const ItemsGroupedComponent = ({ group: { name, checked, group, home, ingredientId } }: Props) => {
  const [open, setOpen] = useState(false);
  const toggleItems = useShoppingItemsStore((state) => state.toggleItems);
  const toggleHome = useShoppingItemsStore((state) => state.toggleHome);
  const updateItem = useShoppingItemsStore((state) => state.updateItem);

  if (group.length === 1 && group[0]) {
    const item = group[0];
    return (
      <ItemComponent item={item}>
        <EditItemHome
          home={item.home}
          onHome={async (home) =>
            toggleHome({
              home,
              items: [{ id: item.ingredientId, name: item.ingredient.name }],
            })
          }
        />
        {item.menuId ? null : (
          <SearchModal
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
                  name: i.name,
                  ingredientId: i.id,
                  quantity: i.quantity,
                  unit: i.unit,
                  id: item.id,
                },
              });
            }}
          />
        )}
      </ItemComponent>
    );
  }
  const unitItem = group.every((i) => i.unit === group[0]?.unit)
    ? {
        quantity: group.reduce((acc, item) => acc + item.quantity, 0),
        unit: group[0]!.unit,
      }
    : null;

  return (
    <li
      className={cn(
        "flex flex-col gap-1 rounded-md bg-c5 transition-opacity",
        checked && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1">
        <Input
          className="size-4 cursor-pointer"
          type="checkbox"
          name="checkGroup"
          checked={checked}
          id={`check-group-${name}`}
          onChange={(event) =>
            toggleItems(
              group.map(({ id }) => ({
                id,
                checked: event.currentTarget.checked,
                name,
              })),
            )
          }
        />
        <p className="grow font-bold text-c5 select-none first-letter:capitalize">{name}</p>
        <EditItemHome
          home={home}
          onHome={async (home) =>
            toggleHome({
              home,
              items: [{ id: ingredientId, name }],
            })
          }
        />
        {unitItem ? (
          <div className="flex gap-1 text-c5 select-none">
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
            <ItemComponent key={item.id} item={item}>
              {item.menuId ? null : (
                <SearchModal
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
                        name: i.name,
                        ingredientId: i.id,
                        quantity: i.quantity,
                        unit: i.unit,
                        id: item.id,
                      },
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
