import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import type { User } from "~/server/auth";
import type { Item } from "~/server/shared";
import type * as ShoppingItemsStore from "./shopping-items-store";

let checkItemsMock: (props: {
  ids: { id: string; checked: boolean; name: string }[];
  user: User;
}) => Promise<void>;
let removeCheckedItemsMock: (props: {
  removable: { id: string; name: string }[];
  user: User;
}) => Promise<void>;
let addItemMock: (props: {
  item: { id: string; quantity: number; unit: "st"; name: string };
  user: User;
}) => Promise<Item>;
let toggleHomeMock: (props: {
  home: boolean;
  items: { id: string; name: string }[];
  user: User;
}) => Promise<void>;
let updateItemMock: (props: {
  item: {
    id: string;
    quantity: number;
    unit: "st";
    ingredientId: string;
    name: string;
  };
  user: User;
}) => Promise<Item>;
let addCommentMock: (props: {
  comment: string;
  item: { id: string; name: string };
  user: User;
}) => Promise<NonNullable<Item["comments"]>>;
let updateCommentMock: (props: {
  comment: string;
  commentId: string;
  name: string;
  user: User;
}) => Promise<NonNullable<Item["comments"]>>;
let deleteCommentMock: (props: {
  commentId: string;
  name: string;
  user: User;
}) => Promise<void>;

const user: User = { id: "user-id", admin: false };
const originalConsoleError = console.error;
let resetShoppingItemsStore: typeof ShoppingItemsStore.resetShoppingItemsStore;
let useShoppingItemsStore: typeof ShoppingItemsStore.useShoppingItemsStore;

const item = ({
  id,
  checked = false,
  name = id,
}: {
  id: string;
  checked?: boolean;
  name?: string;
}): Item =>
  ({
    id,
    checked,
    quantity: 1,
    unit: "st",
    ingredientId: `ingredient-${id}`,
    recipeIngredientId: null,
    ingredient: {
      name,
      category: { id: 1, name: "Pantry" },
      subcategory: { id: 1, name: "Shelf" },
    },
    comments: undefined,
    home: false,
    menu: null,
    menuId: null,
  }) as Item;

const expectOfflineFailure = async (action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("offline");
    return;
  }
  throw new Error("Expected action to throw");
};

describe("shopping items store", () => {
  beforeAll(async () => {
    await mock.module("./shopping-items-api", () => ({
      addItem: (props: Parameters<typeof addItemMock>[0]) => addItemMock(props),
      checkItems: (props: Parameters<typeof checkItemsMock>[0]) =>
        checkItemsMock(props),
      removeCheckedItems: (
        props: Parameters<typeof removeCheckedItemsMock>[0],
      ) => removeCheckedItemsMock(props),
      toggleHome: (props: Parameters<typeof toggleHomeMock>[0]) =>
        toggleHomeMock(props),
      updateItem: (props: {
        item: Parameters<typeof updateItemMock>[0]["item"] & { unit: string };
        user: User;
      }) =>
        updateItemMock({
          item: { ...props.item, unit: props.item.unit as "st" },
          user: props.user,
        }),
      addComment: (props: Parameters<typeof addCommentMock>[0]) =>
        addCommentMock(props),
      updateComment: (props: Parameters<typeof updateCommentMock>[0]) =>
        updateCommentMock(props),
      deleteComment: (props: Parameters<typeof deleteCommentMock>[0]) =>
        deleteCommentMock(props),
      searchItem: async () => [],
    }));

    const store = await import("./shopping-items-store");
    resetShoppingItemsStore = store.resetShoppingItemsStore;
    useShoppingItemsStore = store.useShoppingItemsStore;
  });

  beforeEach(() => {
    console.error = () => undefined;
    checkItemsMock = async () => undefined;
    removeCheckedItemsMock = async () => undefined;
    addItemMock = async ({ item }) =>
      ({
        id: "new-item",
        quantity: item.quantity,
        unit: item.unit,
        ingredientId: item.id,
        recipeIngredientId: null,
        checked: false,
        ingredient: {
          name: item.name,
          category: { id: 3, name: "New category" },
          subcategory: { id: 3, name: "New subcategory" },
        },
        comments: undefined,
        home: false,
        menu: null,
        menuId: null,
      }) as Item;
    toggleHomeMock = async () => undefined;
    updateItemMock = async ({ item }) =>
      ({
        id: item.id,
        quantity: item.quantity,
        unit: item.unit,
        ingredientId: item.ingredientId,
        recipeIngredientId: null,
        checked: false,
        ingredient: {
          name: item.name,
          category: { id: 2, name: "Updated category" },
          subcategory: { id: 2, name: "Updated subcategory" },
        },
        comments: undefined,
        home: false,
        menu: null,
        menuId: null,
      }) as Item;
    addCommentMock = async ({ comment, item }) => ({
      id: "comment-id",
      itemId: item.id,
      comment,
    });
    updateCommentMock = async ({ comment, commentId }) => ({
      id: commentId,
      itemId: "a",
      comment,
    });
    deleteCommentMock = async () => undefined;
    resetShoppingItemsStore();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  afterAll(() => {
    mock.restore();
  });

  test("hydrates items from server data", () => {
    const items = [item({ id: "a" }), item({ id: "b", checked: true })];

    useShoppingItemsStore.getState().initialize(items, user);

    expect(
      useShoppingItemsStore.getState().items.map((i) => i.checked),
    ).toEqual([false, true]);
  });

  test("hydrates the selected store from server data", () => {
    useShoppingItemsStore.getState().initialize([], user, "store-a");

    expect(useShoppingItemsStore.getState().selectedStoreId).toBe("store-a");
  });

  test("keeps a locally selected store across hydration", () => {
    useShoppingItemsStore.getState().initialize([], user, "store-a");
    useShoppingItemsStore.getState().setStoreId("store-b");

    useShoppingItemsStore.getState().initialize([], user, "store-a");

    expect(useShoppingItemsStore.getState().selectedStoreId).toBe("store-b");
  });

  test("resets pending checks and selected store when user changes", () => {
    const nextUser: User = { id: "next-user", admin: false };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a" })], user, "store-a");
    useShoppingItemsStore.getState().setStoreId("store-b");
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "b" })], nextUser, "store-c");

    expect(useShoppingItemsStore.getState().items.map((i) => i.id)).toEqual([
      "b",
    ]);
    expect(useShoppingItemsStore.getState().pending).toEqual({});
    expect(useShoppingItemsStore.getState().selectedStoreId).toBe("store-c");
    expect(useShoppingItemsStore.getState().syncStatus).toBe("idle");
  });

  test("clears pending sync timer when user changes", async () => {
    const calls: Parameters<typeof checkItemsMock>[0][] = [];
    const nextUser: User = { id: "next-user", admin: false };
    checkItemsMock = async (props) => {
      calls.push(props);
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    useShoppingItemsStore.getState().initialize([], nextUser);
    await new Promise((resolve) => setTimeout(resolve, 1400));

    expect(calls).toEqual([]);
  });

  test("toggleItems updates checked state immediately", () => {
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    expect(
      useShoppingItemsStore.getState().items.find((item) => item.id === "a")
        ?.checked,
    ).toBe(true);
    expect(useShoppingItemsStore.getState().pending.a?.checked).toBe(true);
  });

  test("toggleItems updates every grouped item", () => {
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a" }), item({ id: "b" })], user);

    useShoppingItemsStore.getState().toggleItems([
      { id: "a", checked: true, name: "Flour" },
      { id: "b", checked: true, name: "Flour" },
    ]);

    expect(
      useShoppingItemsStore.getState().items.map((i) => i.checked),
    ).toEqual([true, true]);
  });

  test("repeated toggles keep only the latest pending value", () => {
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: false, name: "Flour" }]);

    expect(useShoppingItemsStore.getState().items[0]?.checked).toBe(false);
    expect(useShoppingItemsStore.getState().pending.a).toBeUndefined();
  });

  test("server hydration does not overwrite pending local checks", () => {
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    expect(
      useShoppingItemsStore.getState().items.find((item) => item.id === "a")
        ?.checked,
    ).toBe(true);
  });

  test("successful flush clears sent pending checks", async () => {
    const calls: Parameters<typeof checkItemsMock>[0][] = [];
    checkItemsMock = async (props) => {
      calls.push(props);
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    await useShoppingItemsStore.getState().flushPending();

    expect(calls[0]?.ids).toEqual([{ id: "a", checked: true, name: "Flour" }]);
    expect(useShoppingItemsStore.getState().pending).toEqual({});
    expect(useShoppingItemsStore.getState().syncStatus).toBe("idle");
  });

  test("failed flush keeps pending checks", async () => {
    checkItemsMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    await useShoppingItemsStore.getState().flushPending();

    expect(useShoppingItemsStore.getState().pending.a?.checked).toBe(true);
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("removeCheckedItems removes rows optimistically and syncs server", async () => {
    const calls: Parameters<typeof removeCheckedItemsMock>[0][] = [];
    removeCheckedItemsMock = async (props) => {
      calls.push(props);
    };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a", checked: true }), item({ id: "b" })], user);

    await useShoppingItemsStore
      .getState()
      .removeCheckedItems([{ id: "a", name: "Flour" }], user);

    expect(
      useShoppingItemsStore.getState().items.map((item) => item.id),
    ).toEqual(["b"]);
    expect(calls[0]?.removable).toEqual([{ id: "a", name: "Flour" }]);
  });

  test("failed removeCheckedItems restores removed rows", async () => {
    removeCheckedItemsMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a", checked: true }), item({ id: "b" })], user);

    await expectOfflineFailure(() =>
      useShoppingItemsStore
        .getState()
        .removeCheckedItems([{ id: "a", name: "Flour" }], user),
    );

    expect(
      useShoppingItemsStore
        .getState()
        .items.map((item) => item.id)
        .toSorted(),
    ).toEqual(["a", "b"]);
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("failed removeCheckedItems restores pending checks", async () => {
    removeCheckedItemsMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a" }), item({ id: "b" })], user);
    useShoppingItemsStore
      .getState()
      .toggleItems([{ id: "a", checked: true, name: "Flour" }]);

    await expectOfflineFailure(() =>
      useShoppingItemsStore
        .getState()
        .removeCheckedItems([{ id: "a", name: "Flour" }], user),
    );

    const restoredItem = useShoppingItemsStore
      .getState()
      .items.find((item) => item.id === "a");
    expect(restoredItem?.checked).toBe(true);
    expect(useShoppingItemsStore.getState().pending.a).toEqual({
      id: "a",
      checked: true,
      name: "Flour",
    });
    expect(useShoppingItemsStore.getState().lastSynced.a).toBe(false);
  });

  test("toggleHome updates matching ingredient rows optimistically", async () => {
    const calls: Parameters<typeof toggleHomeMock>[0][] = [];
    toggleHomeMock = async (props) => {
      calls.push(props);
    };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a" }), item({ id: "b" })], user);

    await useShoppingItemsStore.getState().toggleHome({
      home: false,
      items: [{ id: "ingredient-a", name: "Flour" }],
      user,
    });

    expect(useShoppingItemsStore.getState().items[0]?.home).toBe(true);
    expect(useShoppingItemsStore.getState().items[1]?.home).toBe(false);
    expect(calls[0]?.items).toEqual([{ id: "ingredient-a", name: "Flour" }]);
  });

  test("failed toggleHome restores previous home values", async () => {
    toggleHomeMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore
      .getState()
      .initialize([item({ id: "a" }), item({ id: "b" })], user);

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().toggleHome({
        home: false,
        items: [{ id: "ingredient-a", name: "Flour" }],
        user,
      }),
    );

    expect(useShoppingItemsStore.getState().items[0]?.home).toBe(false);
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("addItem appends the server item", async () => {
    const calls: Parameters<typeof addItemMock>[0][] = [];
    addItemMock = async (props) => {
      calls.push(props);
      return item({ id: "server-item", name: props.item.name });
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await useShoppingItemsStore.getState().addItem({
      item: { id: "ingredient-new", quantity: 2, unit: "st", name: "Milk" },
      user,
    });

    expect(
      useShoppingItemsStore.getState().items.map((item) => item.id),
    ).toEqual(["a", "server-item"]);
    expect(calls[0]?.item.name).toBe("Milk");
  });

  test("failed addItem keeps existing items", async () => {
    addItemMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().addItem({
        item: { id: "ingredient-new", quantity: 2, unit: "st", name: "Milk" },
        user,
      }),
    );

    expect(
      useShoppingItemsStore.getState().items.map((item) => item.id),
    ).toEqual(["a"]);
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("updateItem updates optimistically and replaces with server item", async () => {
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await useShoppingItemsStore.getState().updateItem({
      item: {
        id: "a",
        ingredientId: "ingredient-updated",
        quantity: 3,
        unit: "st",
        name: "Milk",
      },
      user,
    });

    const updated = useShoppingItemsStore.getState().items[0];
    expect(updated?.ingredientId).toBe("ingredient-updated");
    expect(updated?.quantity).toBe(3);
    expect(updated?.ingredient.category.name).toBe("Updated category");
  });

  test("failed updateItem restores the previous item", async () => {
    updateItemMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().updateItem({
        item: {
          id: "a",
          ingredientId: "ingredient-updated",
          quantity: 3,
          unit: "st",
          name: "Milk",
        },
        user,
      }),
    );

    const restored = useShoppingItemsStore.getState().items[0];
    expect(restored?.ingredientId).toBe("ingredient-a");
    expect(restored?.quantity).toBe(1);
    expect(restored?.ingredient.name).toBe("a");
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("addComment updates the matching item comment", async () => {
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await useShoppingItemsStore.getState().addComment({
      comment: "remember this",
      item: { id: "a", name: "Flour" },
      user,
    });

    expect(useShoppingItemsStore.getState().items[0]?.comments).toEqual({
      id: "comment-id",
      itemId: "a",
      comment: "remember this",
    });
  });

  test("failed addComment restores the item without a comment", async () => {
    addCommentMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize([item({ id: "a" })], user);

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().addComment({
        comment: "remember this",
        item: { id: "a", name: "Flour" },
        user,
      }),
    );

    expect(useShoppingItemsStore.getState().items[0]?.comments).toBeUndefined();
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("updateComment updates optimistically and replaces with server comment", async () => {
    useShoppingItemsStore.getState().initialize(
      [
        {
          ...item({ id: "a" }),
          comments: { id: "comment-id", itemId: "a", comment: "old" },
        },
      ],
      user,
    );

    await useShoppingItemsStore.getState().updateComment({
      comment: "new",
      commentId: "comment-id",
      name: "Flour",
      user,
    });

    expect(useShoppingItemsStore.getState().items[0]?.comments?.comment).toBe(
      "new",
    );
  });

  test("failed updateComment restores the previous comment", async () => {
    updateCommentMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize(
      [
        {
          ...item({ id: "a" }),
          comments: { id: "comment-id", itemId: "a", comment: "old" },
        },
      ],
      user,
    );

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().updateComment({
        comment: "new",
        commentId: "comment-id",
        name: "Flour",
        user,
      }),
    );

    expect(useShoppingItemsStore.getState().items[0]?.comments?.comment).toBe(
      "old",
    );
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });

  test("deleteComment removes the matching item comment", async () => {
    useShoppingItemsStore.getState().initialize(
      [
        {
          ...item({ id: "a" }),
          comments: { id: "comment-id", itemId: "a", comment: "old" },
        },
      ],
      user,
    );

    await useShoppingItemsStore.getState().deleteComment({
      commentId: "comment-id",
      name: "Flour",
      user,
    });

    expect(useShoppingItemsStore.getState().items[0]?.comments).toBeUndefined();
  });

  test("failed deleteComment restores the previous comment", async () => {
    deleteCommentMock = async () => {
      throw new Error("offline");
    };
    useShoppingItemsStore.getState().initialize(
      [
        {
          ...item({ id: "a" }),
          comments: { id: "comment-id", itemId: "a", comment: "old" },
        },
      ],
      user,
    );

    await expectOfflineFailure(() =>
      useShoppingItemsStore.getState().deleteComment({
        commentId: "comment-id",
        name: "Flour",
        user,
      }),
    );

    expect(useShoppingItemsStore.getState().items[0]?.comments?.comment).toBe(
      "old",
    );
    expect(useShoppingItemsStore.getState().syncStatus).toBe("error");
  });
});
