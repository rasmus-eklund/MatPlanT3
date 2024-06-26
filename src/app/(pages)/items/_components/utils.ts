import type { Item, StoreWithItems } from "~/server/shared";
import type { ItemsGrouped } from "~/types";

export const groupItemsByName = (items: Item[]): ItemsGrouped[] => {
  const start: ItemsGrouped[] = [];
  const groupedItems = items.reduce((acc, item) => {
    const group = acc.find(
      (groupItem) => groupItem.name === item.ingredient.name,
    );
    if (group) {
      group.group.push(item);
    } else {
      const newGroup: ItemsGrouped = {
        name: item.ingredient.name,
        group: [item],
        checked: false,
        subcategoryId: item.ingredient.subcategory.id,
        home: item.home,
        ingredientId: item.ingredientId
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

export const groupByUnit = (items: Item[]) => {
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

export const sortBySubCategory = (
  category: StoreWithItems["store_categories"][number],
  items: ItemsGrouped[],
) =>
  items.sort(
    (a, b) =>
      category.store_subcategories.findIndex(
        (i) => i.subcategory.id === a.subcategoryId,
      ) -
      category.store_subcategories.findIndex(
        (i) => i.subcategory.id === b.subcategoryId,
      ),
  );
