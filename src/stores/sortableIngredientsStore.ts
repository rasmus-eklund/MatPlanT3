import { create } from "zustand";
import type { Recipe } from "~/server/shared";

export const useSortableIngredientsStore = create<{
  groups: Record<string, Recipe["groups"][number]["ingredients"]>;
  setGroups: (
    groups: Record<string, Recipe["groups"][number]["ingredients"]>,
  ) => void;
  groupsOrder: { id: string; name: string }[];
  setGroupsOrder: (order: { id: string; name: string }[]) => void;
  removeGroup: (groupName: string) => void;
  addGroup: (groupName: string) => void;
  addIngredientToGroup: ({
    groupName,
    ingredient,
  }: {
    groupName: string;
    ingredient: Omit<Recipe["groups"][number]["ingredients"][number], "order">;
  }) => void;
  removeIngredientFromGroup: ({
    groupName,
    id,
  }: {
    groupName: string;
    id: string;
  }) => void;
  updateIngredient: ({
    groupName,
    id,
    ingredient,
  }: {
    groupName: string;
    id: string;
    ingredient: Recipe["groups"][number]["ingredients"][number];
  }) => void;
}>((set, get) => ({
  groups: {},
  setGroups: (groups) => set({ groups }),
  groupsOrder: [],
  setGroupsOrder: (order) => set({ groupsOrder: order }),
  removeGroup: (groupName) =>
    set({
      groups: removeGroup(get().groups, groupName),
      groupsOrder: get().groupsOrder.filter((g) => g.name !== groupName),
    }),
  addGroup: (groupName) =>
    set({
      groups: { ...get().groups, [groupName]: [] },
      groupsOrder: [
        ...get().groupsOrder,
        { name: groupName, id: crypto.randomUUID() },
      ],
    }),
  addIngredientToGroup: ({ groupName, ingredient }) =>
    set((state) => {
      const groupItems = state.groups[groupName];
      if (!groupItems) throw new Error("Group not found");
      return {
        groups: {
          ...state.groups,
          [groupName]: [...groupItems, ingredient].map((i, order) => ({
            ...i,
            order,
          })),
        },
      };
    }),
  removeIngredientFromGroup: ({ groupName, id }) =>
    set((state) => {
      const group = state.groups[groupName];
      if (!group) throw new Error("Group not found");
      return {
        groups: {
          ...state.groups,
          [groupName]: group.filter((i) => i.id !== id),
        },
      };
    }),
  updateIngredient: ({ groupName, id, ingredient }) =>
    set((state) => {
      const group = state.groups[groupName];
      if (!group) throw new Error("Group not found");
      return {
        groups: {
          ...state.groups,
          [groupName]: group.map((i, order) =>
            i.id === id ? { ...i, ...ingredient, order } : i,
          ),
        },
      };
    }),
}));

const removeGroup = (
  groups: Record<string, Recipe["groups"][number]["ingredients"]>,
  groupName: string,
) => {
  const recept = groups.recept;
  const group = groups[groupName];
  if (!recept || !group) {
    return groups;
  }
  recept.push(...group);
  delete groups[groupName];
  return groups;
};
