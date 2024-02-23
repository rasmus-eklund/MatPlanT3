import { tItem, tItemsGrouped, StoreOrder, CategoryItem } from "types";
import type { RouterOutputs } from "~/trpc/shared";
type Items = RouterOutputs["store"]["getById"]["order"];

export const groupSubcategoryByCategory = (items: Items): CategoryItem[] => {
  const start: CategoryItem[] = [];
  return items.reduce((acc, inputItem) => {
    const foundIndex = acc.findIndex(
      (item) => item.id === inputItem.category.id,
    );
    if (foundIndex === -1) {
      acc.push({
        ...inputItem.category,
        subcategories: [{ ...inputItem.subcategory }],
      });
    } else {
      acc[foundIndex]!.subcategories.push({
        ...inputItem.subcategory,
      });
    }
    return acc;
  }, start);
};

export const sortBySubcategory = <
  T extends { name: string; subcategoryId: number },
>(
  store: StoreOrder,
  items: T[],
): T[] => {
  const sortedIngredients = items.sort((a, b) => {
    return (
      store.order.map((i) => i.subcategory.id).indexOf(a.subcategoryId) -
      store.order.map((i) => i.subcategory.id).indexOf(b.subcategoryId)
    );
  });
  return sortedIngredients;
};

export const sortByChecked = <T extends { checked: boolean }>(items: T[]) =>
  items.sort((a, b) => {
    if (a.checked === b.checked) return 0;
    if (a.checked) return 1;
    return -1;
  });

export const groupShoppingListItems = (items: tItem[]): tItemsGrouped[] => {
  const start: tItemsGrouped[] = [];
  const groupedItems = items.reduce((acc, item) => {
    const group = acc.find((groupItem) => groupItem.name === item.name);
    if (group) {
      group.group.push(item);
    } else {
      const newGroup: tItemsGrouped = {
        name: item.name,
        group: [item],
        checked: false,
        subcategoryId: item.subcategoryId,
      };
      acc.push(newGroup);
    }
    return acc;
  }, start);
  return groupedItems.map((group) => ({
    ...group,
    checked: group.group.every((i) => i.checked),
  }));
};

export const groupByUnit = (items: tItem[]) => {
  const start: { quantity: number; unit: string }[] = [];
  return items.reduce((acc, item) => {
    const index = acc.findIndex((i) => i.unit === item.unit);
    if (index !== -1) {
      acc[index]!.quantity += item.quantity;
    } else {
      acc.push({ quantity: item.quantity, unit: item.unit });
    }
    return acc;
  }, start);
};

export const sortByName = <T extends { name: string }>(items: T[]) =>
  items.sort((a, b) => a.name.localeCompare(b.name));
