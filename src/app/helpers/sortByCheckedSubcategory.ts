import { tItem, tItemsGrouped, StoreOrder } from "types";

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
