"use client";
import {
  groupShoppingListItems,
  sortByChecked,
  sortBySubcategory,
} from "~/app/helpers/sortByCheckedSubcategory";
import ItemsGrouped from "./ItemsGrouped";
import Item from "./Item";
import { api } from "~/trpc/react";
import { tItem, tItemFilter } from "types";

type Props = { filter: tItemFilter };

const ShoppingList = ({ filter }: Props) => {
  const { data: items, isSuccess, refetch } = api.item.getAll.useQuery();

  return (
    <>
      <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
        {isSuccess &&
          applyFilter(
            items.filter((i) => !i.home),
            filter,
            refetch,
          )}
      </ul>
      <h2>Hemma</h2>
      <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
        {isSuccess &&
          applyFilter(
            items.filter((i) => i.home),
            filter,
            refetch,
          )}
      </ul>
    </>
  );
};

const applyFilter = (
  items: tItem[],
  filter: tItemFilter,
  update: () => void,
) => {
  return filter.group
    ? sortByChecked(
        sortBySubcategory(
          filter.selectedStore,
          groupShoppingListItems(items),
        ).map(({ group, ...i }) => ({
          ...i,
          group: group.map((i) => ({
            ...i,
            recipe: filter.hideRecipe ? "" : i.recipe,
          })),
        })),
      ).map((group) => (
        <ItemsGrouped key={group.name} group={group} update={update} />
      ))
    : sortByChecked(sortBySubcategory(filter.selectedStore, items))
        .map((i) => ({ ...i, recipe: filter.hideRecipe ? "" : i.recipe }))
        .map((item) => <Item key={item.id} item={item} update={update} />);
};
export default ShoppingList;
