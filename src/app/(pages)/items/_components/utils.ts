import type { Item, StoreWithItems } from "~/server/shared";
import type { ItemsGrouped, QueueItem } from "~/types";
import { checkItems } from "~/server/api/items";

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
        ingredientId: item.ingredientId,
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

const debouncer = () => {
  let queue: Record<string, QueueItem> = {};
  let timeout: NodeJS.Timeout | null = null;

  const debouncedCheckItems = ({
    ids,
    delay = 2000,
  }: {
    ids: QueueItem[];
    delay?: number;
  }) => {
    for (const { id, checked, user } of ids) {
      if (queue[id]) {
        delete queue[id];
      } else {
        queue[id] = { id, checked, user };
      }
    }
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      const ids = Object.values(queue);
      queue = {};
      console.log("Checking items", ids);
      if (ids.length === 0) return;
      checkItems({ ids }).catch((e) =>
        console.error("Failed to batch check items:", e),
      );
    }, delay);
  };
  return debouncedCheckItems;
};

export const debouncedCheckItems = debouncer();
