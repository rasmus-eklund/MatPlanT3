"use client";
import { ChangeEvent, useState } from "react";
import { StoreOrder, tItemFilter } from "types";
import {
  groupShoppingListItems,
  sortByChecked,
  sortBySubcategory,
} from "~/app/helpers/sortByCheckedSubcategory";
import ItemsGrouped from "./ItemsGrouped";
import Item from "./Item";
import { api } from "~/trpc/react";

type Props = {
  filter: tItemFilter;
  stores: StoreOrder[];
};

const Filters = ({ filter, stores }: Props) => {
  const { data: items, isSuccess, refetch } = api.item.getAll.useQuery();

  const [filters, setFilters] = useState<tItemFilter>(filter);
  const handleChangeStore = (e: ChangeEvent<HTMLSelectElement>) => {
    const store = stores.find((store) => store.id === e.target.value)!;
    setFilters({ ...filters, selectedStore: store });
  };

  const handleGroupItems = () =>
    setFilters({ ...filters, group: !filters.group });

  const handleHideRecipe = () =>
    setFilters({ ...filters, hideRecipe: !filters.hideRecipe });

  const { group, selectedStore, hideRecipe } = filters;
  return (
    <>
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
      {isSuccess && (
        <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
          {group
            ? sortByChecked(
                sortBySubcategory(selectedStore, groupShoppingListItems(items)),
              ).map((group) => (
                <ItemsGrouped key={group.name} group={group} update={refetch} />
              ))
            : sortByChecked(sortBySubcategory(selectedStore, items)).map(
                (item) => <Item key={item.id} item={item} update={refetch} />,
              )}
        </ul>
      )}
    </>
  );
};

export default Filters;
