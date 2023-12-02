"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { StoreOrder, tItemFilter } from "types";
import ShoppingList from "./ShoppingList";
import { zItemFilter } from "~/zod/zodSchemas";

type Props = {
  stores: StoreOrder[];
};

const saveFilters = (filters: tItemFilter) => {
  localStorage.setItem(
    "shoppingListFilter",
    JSON.stringify({ ...filters, selectedStore: filters.selectedStore.id }),
  );
};
const loadFilters = (defaultStoreId: string) => {
  const raw = localStorage.getItem("shoppingListFilter");
  const defaultReturn = {
    group: true,
    hideRecipe: true,
    selectedStore: defaultStoreId,
  };
  if (!raw) return defaultReturn;
  const parsed = zItemFilter.safeParse(JSON.parse(raw.toString()));
  if (!parsed.success) {
    return defaultReturn;
  }
  return parsed.data;
};

const Filters = ({ stores }: Props) => {
  const [filters, setFilters] = useState<tItemFilter>({
    group: true,
    hideRecipe: true,
    selectedStore: stores[0]!,
  });

  useEffect(() => {
    const savedFilter = loadFilters(stores[0]!.id);
    const selectedStore = stores.find(
      ({ id }) => id === savedFilter.selectedStore,
    )!;
    setFilters({ ...savedFilter, selectedStore });
  }, []);

  const handleChangeStore = (e: ChangeEvent<HTMLSelectElement>) => {
    const store = stores.find((store) => store.id === e.target.value)!;
    setFilters((p) => {
      saveFilters({ ...p, selectedStore: store });
      return { ...p, selectedStore: store };
    });
  };

  const handleGroupItems = () =>
    setFilters((p) => {
      saveFilters({ ...p, group: !p.group });
      return { ...p, group: !p.group };
    });

  const handleHideRecipe = () =>
    setFilters((p) => {
      saveFilters({ ...p, hideRecipe: !p.hideRecipe });
      return { ...p, hideRecipe: !p.hideRecipe };
    });

  const { group, selectedStore, hideRecipe } = filters;
  return (
    <div className="flex flex-col gap-2 p-2">
      <form className="flex justify-between">
        <select
          className="rounded-md bg-c2 px-2 font-bold text-c4"
          name="store"
          id="store_select"
          value={selectedStore.id}
          onChange={handleChangeStore}
        >
          {stores.map(({ name, id }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex flex-col">
          <div className="flex gap-2">
            <input
              onChange={handleGroupItems}
              checked={group}
              type="checkbox"
              name="group_check"
              id="group_check"
            />
            <label className="text-c5" htmlFor="group_check">
              Gruppera
            </label>
          </div>
          <div className="flex gap-2">
            <input
              onChange={handleHideRecipe}
              checked={hideRecipe}
              type="checkbox"
              name="recipe_check"
              id="recipe_check"
            />
            <label className="text-c5" htmlFor="recipe_check">
              Dölj ursprung
            </label>
          </div>
        </div>
      </form>
      <ShoppingList filter={filters} />
    </div>
  );
};

export default Filters;
