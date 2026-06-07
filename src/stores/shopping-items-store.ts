"use client";

import { create } from "zustand";
import {
  addComment,
  addItem,
  checkItems,
  deleteComment,
  removeCheckedItems as removeCheckedItemsFromServer,
  toggleHome,
  updateComment,
  updateItem as updateItemOnServer,
} from "./shopping-items-api";
import type { User } from "~/server/auth";
import type { Item as ShoppingItem } from "~/server/shared";
import type { QueueItem, Unit } from "~/types";
import type { Item as UpdateItemInput } from "~/zod/zodSchemas";

const syncDelay = 1300;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

type SyncStatus = "idle" | "pending" | "syncing" | "error";

type ShoppingItemsState = {
  items: ShoppingItem[];
  initialized: boolean;
  lastSynced: Record<string, boolean>;
  pending: Record<string, QueueItem>;
  selectedStoreId: string | null;
  syncStatus: SyncStatus;
  user: User | null;
  initialize: (items: ShoppingItem[], user: User, storeId?: string) => void;
  setStoreId: (storeId: string) => void;
  toggleItems: (items: QueueItem[]) => void;
  removeCheckedItems: (
    removable: { id: string; name: string }[],
  ) => Promise<void>;
  toggleHome: (props: {
    home: boolean;
    items: { id: string; name: string }[];
  }) => Promise<void>;
  addItem: (props: {
    item: { id: string; quantity: number; unit: Unit; name: string };
  }) => Promise<void>;
  updateItem: (props: { item: UpdateItemInput }) => Promise<void>;
  addComment: (props: {
    comment: string;
    item: { id: string; name: string };
  }) => Promise<void>;
  updateComment: (props: {
    comment: string;
    commentId: string;
    name: string;
  }) => Promise<void>;
  deleteComment: (props: { commentId: string; name: string }) => Promise<void>;
  flushPending: () => Promise<void>;
};

const applyPending = (
  items: ShoppingItem[],
  pending: Record<string, QueueItem>,
): ShoppingItem[] =>
  items.map((item) => {
    const queued = pending[item.id];
    return queued ? { ...item, checked: queued.checked } : item;
  });

const queueSync = () => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncTimeout = null;
    void useShoppingItemsStore.getState().flushPending();
  }, syncDelay);
};

const clearSyncTimeout = () => {
  if (!syncTimeout) return;
  clearTimeout(syncTimeout);
  syncTimeout = null;
};

export const useShoppingItemsStore = create<ShoppingItemsState>((set, get) => ({
  items: [],
  initialized: false,
  lastSynced: {},
  pending: {},
  selectedStoreId: null,
  syncStatus: "idle",
  user: null,
  initialize: (items, user, storeId) => {
    set((state) => {
      const userChanged =
        state.user?.id !== undefined && state.user.id !== user.id;
      if (userChanged) clearSyncTimeout();
      const pending = userChanged ? {} : state.pending;
      const lastSynced = Object.fromEntries(
        items.map((item) => [item.id, item.checked]),
      );
      return {
        items: applyPending(items, pending),
        initialized: true,
        lastSynced,
        pending,
        selectedStoreId: userChanged
          ? (storeId ?? null)
          : (state.selectedStoreId ?? storeId ?? null),
        syncStatus: userChanged ? "idle" : state.syncStatus,
        user,
      };
    });
  },
  setStoreId: (selectedStoreId) => set({ selectedStoreId }),
  toggleItems: (items) => {
    set((state) => {
      const pending = { ...state.pending };
      for (const item of items) {
        if (state.lastSynced[item.id] === item.checked) {
          delete pending[item.id];
        } else {
          pending[item.id] = item;
        }
      }
      return {
        items: state.items.map((existing) => {
          const queued = items.find((item) => item.id === existing.id);
          return queued ? { ...existing, checked: queued.checked } : existing;
        }),
        pending,
        syncStatus: Object.keys(pending).length ? "pending" : "idle",
      };
    });
    if (Object.keys(get().pending).length) queueSync();
  },
  removeCheckedItems: async (removable) => {
    const removableIds = new Set(removable.map((item) => item.id));
    const stateBeforeRemove = get();
    const removedItems = stateBeforeRemove.items.filter((item) =>
      removableIds.has(item.id),
    );
    const removedPending = new Map(
      [...removableIds]
        .map((id) => [id, stateBeforeRemove.pending[id]] as const)
        .filter(
          (entry): entry is [string, QueueItem] => entry[1] !== undefined,
        ),
    );
    const removedLastSynced = new Map(
      [...removableIds]
        .map((id) => [id, stateBeforeRemove.lastSynced[id]] as const)
        .filter((entry): entry is [string, boolean] => entry[1] !== undefined),
    );

    set((state) => {
      const pending = { ...state.pending };
      const lastSynced = { ...state.lastSynced };
      for (const id of removableIds) {
        delete pending[id];
        delete lastSynced[id];
      }
      return {
        items: state.items.filter((item) => !removableIds.has(item.id)),
        pending,
        lastSynced,
      };
    });

    try {
      await removeCheckedItemsFromServer({ removable });
    } catch (error) {
      console.error("Failed to remove checked shopping items:", error);
      set((state) => {
        const existingIds = new Set(state.items.map((item) => item.id));
        const restoredItems = removedItems.filter(
          (item) => !existingIds.has(item.id),
        );
        const pending = { ...state.pending };
        const lastSynced = { ...state.lastSynced };
        for (const id of removableIds) {
          const pendingItem = removedPending.get(id);
          if (pendingItem) {
            pending[id] = pendingItem;
          } else {
            delete pending[id];
          }

          if (removedLastSynced.has(id)) {
            lastSynced[id] = removedLastSynced.get(id)!;
          } else {
            delete lastSynced[id];
          }
        }
        return {
          items: [...state.items, ...restoredItems],
          pending,
          lastSynced,
          syncStatus: "error",
        };
      });
      throw error;
    }
  },
  toggleHome: async ({ home, items }) => {
    const ingredientIds = new Set(items.map((item) => item.id));
    const previous = get().items.filter((item) =>
      ingredientIds.has(item.ingredientId),
    );
    set((state) => ({
      items: state.items.map((item) =>
        ingredientIds.has(item.ingredientId) ? { ...item, home: !home } : item,
      ),
    }));

    try {
      await toggleHome({ home, items });
    } catch (error) {
      console.error("Failed to update shopping item home status:", error);
      const previousById = new Map(previous.map((item) => [item.id, item]));
      set((state) => ({
        items: state.items.map((item) => previousById.get(item.id) ?? item),
        syncStatus: "error",
      }));
      throw error;
    }
  },
  addItem: async ({ item }) => {
    try {
      const addedItem = await addItem({ item });
      set((state) => ({
        items: [...state.items, addedItem],
        lastSynced: { ...state.lastSynced, [addedItem.id]: addedItem.checked },
      }));
    } catch (error) {
      console.error("Failed to add shopping item:", error);
      set({ syncStatus: "error" });
      throw error;
    }
  },
  updateItem: async ({ item }) => {
    const previous = get().items.find((existing) => existing.id === item.id);
    if (previous) {
      set((state) => ({
        items: state.items.map((existing) =>
          existing.id === item.id
            ? {
                ...existing,
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                ingredient: { ...existing.ingredient, name: item.name },
              }
            : existing,
        ),
      }));
    }

    try {
      const updatedItem = await updateItemOnServer({ item });
      set((state) => ({
        items: state.items.map((existing) =>
          existing.id === updatedItem.id ? updatedItem : existing,
        ),
      }));
    } catch (error) {
      console.error("Failed to update shopping item:", error);
      if (previous) {
        set((state) => ({
          items: state.items.map((existing) =>
            existing.id === previous.id ? previous : existing,
          ),
          syncStatus: "error",
        }));
      } else {
        set({ syncStatus: "error" });
      }
      throw error;
    }
  },
  addComment: async ({ comment, item }) => {
    const tempComment = {
      id: `pending-${crypto.randomUUID()}`,
      itemId: item.id,
      comment,
    };
    set((state) => ({
      items: state.items.map((existing) =>
        existing.id === item.id
          ? { ...existing, comments: tempComment }
          : existing,
      ),
    }));

    try {
      const addedComment = await addComment({ comment, item });
      set((state) => ({
        items: state.items.map((existing) =>
          existing.id === item.id
            ? { ...existing, comments: addedComment }
            : existing,
        ),
      }));
    } catch (error) {
      console.error("Failed to add shopping item comment:", error);
      set((state) => ({
        items: state.items.map((existing) =>
          existing.id === item.id
            ? { ...existing, comments: undefined }
            : existing,
        ),
        syncStatus: "error",
      }));
      throw error;
    }
  },
  updateComment: async ({ comment, commentId, name }) => {
    const previous = get().items.find(
      (item) => item.comments?.id === commentId,
    )?.comments;
    set((state) => ({
      items: state.items.map((item) =>
        item.comments?.id === commentId
          ? { ...item, comments: { ...item.comments, comment } }
          : item,
      ),
    }));

    try {
      const updatedComment = await updateComment({
        comment,
        commentId,
        name,
      });
      set((state) => ({
        items: state.items.map((item) =>
          item.comments?.id === commentId
            ? { ...item, comments: updatedComment }
            : item,
        ),
      }));
    } catch (error) {
      console.error("Failed to update shopping item comment:", error);
      if (previous) {
        set((state) => ({
          items: state.items.map((item) =>
            item.comments?.id === commentId
              ? { ...item, comments: previous }
              : item,
          ),
          syncStatus: "error",
        }));
      } else {
        set({ syncStatus: "error" });
      }
      throw error;
    }
  },
  deleteComment: async ({ commentId, name }) => {
    const previousItem = get().items.find(
      (item) => item.comments?.id === commentId,
    );
    const previous = previousItem?.comments;
    set((state) => ({
      items: state.items.map((item) =>
        item.comments?.id === commentId
          ? { ...item, comments: undefined }
          : item,
      ),
    }));

    try {
      await deleteComment({ commentId, name });
    } catch (error) {
      console.error("Failed to delete shopping item comment:", error);
      if (previous && previousItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === previousItem.id
              ? { ...item, comments: previous }
              : item,
          ),
          syncStatus: "error",
        }));
      } else {
        set({ syncStatus: "error" });
      }
      throw error;
    }
  },
  flushPending: async () => {
    const { pending, user } = get();
    const queued = Object.values(pending);
    if (!queued.length || !user) return;
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      set({ syncStatus: "error" });
      return;
    }
    set({ syncStatus: "syncing" });
    try {
      await checkItems({ ids: queued });
      set((state) => {
        const nextPending = { ...state.pending };
        const lastSynced = { ...state.lastSynced };
        for (const item of queued) {
          if (nextPending[item.id]?.checked === item.checked) {
            delete nextPending[item.id];
            lastSynced[item.id] = item.checked;
          }
        }
        return {
          lastSynced,
          pending: nextPending,
          syncStatus: Object.keys(nextPending).length ? "pending" : "idle",
        };
      });
      if (Object.keys(get().pending).length) queueSync();
    } catch (error) {
      console.error("Failed to sync shopping items:", error);
      set({ syncStatus: "error" });
    }
  },
}));

// Used for testing
export const resetShoppingItemsStore = () => {
  clearSyncTimeout();
  useShoppingItemsStore.setState({
    items: [],
    initialized: false,
    lastSynced: {},
    pending: {},
    selectedStoreId: null,
    syncStatus: "idle",
    user: null,
  });
};
