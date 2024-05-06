import type { Recipe } from "~/server/shared";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove as dndKitArrayMove } from "@dnd-kit/sortable";
import type { Dispatch, SetStateAction } from "react";
import type { IngredientGroup, RecipeFormUpdateItem, Unit } from "~/types";

export const removeAtIndex = <T>(array: T[], index: number) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export const insertAtIndex = <T>(array: T[], index: number, item: T) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export const arrayMove = <T>(
  array: T[],
  oldIndex: number,
  newIndex: number,
) => {
  return dndKitArrayMove(array, oldIndex, newIndex);
};

type MoveProps<
  Item extends { id: string },
  Group extends { id: string; ingredients: Item[] },
> = {
  items: Group[];
  fromGroupId: string;
  fromIndex: number;
  toGroupId: string;
  toIndex: number;
  item: Item;
};
export const moveBetweenContainers = <
  Item extends { id: string },
  Group extends { id: string; ingredients: Item[] },
>({
  items,
  item,
  fromGroupId,
  toGroupId,
  fromIndex,
  toIndex,
}: MoveProps<Item, Group>): Group[] => {
  const fromGroupIndex = items.findIndex((i) => i.id === fromGroupId);
  const toGroupIndex = items.findIndex((i) => i.id === toGroupId);
  if (fromGroupIndex === -1 || toGroupIndex === -1) {
    return items;
  }
  return items.map((i) => {
    if (i.id === fromGroupId) {
      return { ...i, ingredients: removeAtIndex(i.ingredients, fromIndex) };
    }
    if (i.id === toGroupId) {
      return {
        ...i,
        ingredients: insertAtIndex(i.ingredients, toIndex, item),
      };
    }
    return i;
  });
};

type Data = {
  active: {
    data: {
      current: {
        sortable: { containerId: string; index: number; items: string[] };
      };
    };
  };
  over: {
    data: {
      current: {
        sortable: { containerId: string; index: number; items: string[] };
      };
    };
  };
};

export type SetActive = {
  id: string;
  name: string;
  ingredients?: IngredientGroup["ingredients"];
} | null;

export const handleDragOver = (
  event: DragOverEvent,
  setItems: Dispatch<SetStateAction<IngredientGroup[]>>,
) => {
  const { active, over } = event as DragOverEvent & Data;
  if (!over) {
    return;
  }
  const { containerId: fromGroupId, index: fromIndex } =
    active.data.current.sortable;
  const { containerId: toGroupId, index: toIndex } = over.data.current.sortable;
  if (fromGroupId === "groups" && toGroupId === "groups") {
    return;
  }

  if (fromGroupId !== toGroupId) {
    setItems((items) => {
      const group = items.find((i) => i.id === fromGroupId);
      if (!group) {
        return items;
      }
      const item = group.ingredients.find((i) => i.id === active.id);
      if (!item) {
        return items;
      }
      const newToGroupId =
        toGroupId === "groups" ? (over.id as string) : toGroupId;
      const newToIndex =
        toGroupId === "groups" ? group.ingredients.length + 1 : toIndex;
      if (newToGroupId === fromGroupId) {
        return items;
      }
      return moveBetweenContainers({
        items,
        item,
        fromGroupId,
        toGroupId: newToGroupId,
        fromIndex,
        toIndex: newToIndex,
      });
    });
  }
};

export const handleDragEnd = (
  event: DragEndEvent,
  setItems: Dispatch<SetStateAction<IngredientGroup[]>>,
  setActive: Dispatch<SetStateAction<SetActive>>,
) => {
  const { active, over } = event as DragEndEvent & Data;
  if (!over) {
    setActive(null);
    return;
  }
  if (active.id !== over.id) {
    const { containerId: fromGroupId, index: fromIndex } =
      active.data.current.sortable;
    const { containerId: toGroupId, index: toIndex } =
      over.data.current.sortable;

    // Dragging a group
    if (fromGroupId === "groups" && toGroupId === "groups") {
      if (fromGroupId === over.id) {
        return;
      }
      setItems((items) => arrayMove(items, fromIndex, toIndex));
      return;
    }
    // Dragging an item
    setItems((items) => {
      // Move item within its container
      if (fromGroupId === toGroupId) {
        return items.map((i) =>
          i.id === toGroupId
            ? {
                ...i,
                ingredients: arrayMove(i.ingredients, fromIndex, toIndex),
              }
            : i,
        );
      }
      // Move item to other container
      const group = items.find((i) => i.id === fromGroupId);
      if (!group) {
        return items;
      }
      const item = group.ingredients.find((i) => i.id === active.id);
      if (!item) {
        return items;
      }
      const newToGroupId =
        toGroupId === "groups" ? (over.id as string) : toGroupId;
      const newToIndex =
        toGroupId === "groups" ? group.ingredients.length + 1 : toIndex;
      // Drop item on same container
      if (newToGroupId === fromGroupId) {
        return items;
      }
      return moveBetweenContainers({
        items,
        fromGroupId,
        fromIndex,
        toGroupId: newToGroupId,
        toIndex: newToIndex,
        item,
      });
    });
  }
};

export const handleDragStart = (
  event: DragStartEvent,
  items: IngredientGroup[],
  setActive: Dispatch<SetStateAction<SetActive>>,
) => {
  const { active } = event as DragStartEvent & Data;
  const id = active.data.current.sortable.containerId;
  if (id === "groups") {
    const group = items.find((i) => i.id === active.id);
    if (group) {
      setActive(group);
    }
  }
  const group = items.find((i) => i.id === id);
  if (group) {
    const item = group.ingredients.find((i) => i.id === active.id)!;
    setActive(item);
  }
};

export const groupIngredients = (ingredients: Recipe["ingredients"]) => {
  const groups: IngredientGroup[] = [
    { id: "recept", name: "recept", ingredients: [], order: -1 },
  ];
  for (const ing of ingredients) {
    if (!ing.group) {
      const group = groups.find((i) => i.name === "recept");
      if (!group) {
        groups.push({
          id: "recept",
          name: "recept",
          order: -1,
          ingredients: [ing],
        });
      } else {
        group.ingredients.push(ing);
      }
    } else {
      const { name, id } = ing.group;
      const group = groups.find((group) => group.name === name);
      if (!group) {
        groups.push({ id, name, ingredients: [ing], order: 0 });
      } else {
        group.ingredients.push(ing);
      }
    }
  }
  for (const group of groups) {
    group.ingredients.sort((a, b) => a.order - b.order);
  }
  return groups.sort((a, b) => a.order - b.order);
};

export const addGroup = (
  name: string,
  groups: IngredientGroup[],
): IngredientGroup[] => [
  { id: name, ingredients: [], name, order: 0 },
  ...groups,
];

type NewIngProps = {
  recipeId: string;
  name: string;
  ingredientId: string;
};
export const newIng = ({
  recipeId,
  name,
  ingredientId,
}: NewIngProps): Recipe["ingredients"][number] => ({
  recipeId,
  group: { id: "recept", name: "recept", order: 0, recipeId },
  name,
  ingredientId,
  quantity: 1,
  unit: "st" as Unit,
  id: crypto.randomUUID(),
  order: 0,
});

export const updateItem = (
  groupId: string,
  groups: IngredientGroup[],
  item: RecipeFormUpdateItem,
): IngredientGroup[] => {
  return [
    ...groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          ingredients: group.ingredients.map((i) => {
            if (i.id === item.id) {
              return { ...i, ...item };
            }
            return i;
          }),
        };
      }
      return group;
    }),
  ];
};

export const insertIngredientToGroup = (
  item: Recipe["ingredients"][number],
  setItems: Dispatch<SetStateAction<IngredientGroup[]>>,
) => {
  setItems((items) =>
    items.map((i) => {
      if (i.id === "recept") {
        return { ...i, ingredients: [item, ...i.ingredients] };
      }
      return i;
    }),
  );
};

export const removeGroup = (
  groupId: string,
  setItems: Dispatch<SetStateAction<IngredientGroup[]>>,
) => {
  setItems((items) => {
    const group = items.find((i) => i.id === groupId);
    const recept = items.find((i) => i.id === "recept");
    if (!group || !recept) {
      return items;
    }
    return items
      .filter((i) => i.id !== groupId)
      .map((i) => {
        if (i.id === "recept") {
          return {
            ...i,
            ingredients: [...group.ingredients, ...i.ingredients],
          };
        }
        return i;
      });
  });
};
