import "~/test/setup-backend";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  category,
  store,
  store_category,
  store_subcategory,
  subcategory,
} from "~/server/db/schema";
import { resetRecipeTables, seedBaseFixtures } from "~/test/recipeTestHarness";
import { sideEffects } from "./sideEffects";

const {
  addStore,
  createNewStore,
  deleteStore,
  getAllStores,
  getStoreById,
  renameStore,
  setDefaultStore,
  updateStoreOrder,
} = await import("./stores");

class NotFoundSignal extends Error {
  constructor() {
    super("notFound");
  }
}

const originalSideEffects = { ...sideEffects };
const sideEffectState: {
  notFoundCalls: number;
  revalidated: string[];
  logs: Array<{ action: string; userId: string }>;
  authorizedUser: { id: string; admin: boolean } | null;
} = {
  notFoundCalls: 0,
  revalidated: [],
  logs: [],
  authorizedUser: null,
};

const resetSideEffects = () => {
  sideEffectState.notFoundCalls = 0;
  sideEffectState.revalidated = [];
  sideEffectState.logs = [];
  sideEffectState.authorizedUser = null;
};

const authorizeAs = (user: { id: string }) => {
  sideEffectState.authorizedUser = { id: user.id, admin: false };
};

const defined = <T>(value: T | undefined): T => {
  expect(value).toBeDefined();
  return value as T;
};

const captureError = async (action: Promise<unknown>) => {
  try {
    await action;
    return undefined;
  } catch (error: unknown) {
    return error;
  }
};

const expectNotFound = async (action: Promise<unknown>) => {
  const error = await captureError(action);
  expect(error).toBeInstanceOf(NotFoundSignal);
  expect(sideEffectState.notFoundCalls).toBe(1);
};

const resetStoreTables = async () => {
  /* eslint-disable drizzle/enforce-delete-with-where */
  await db.delete(store_subcategory);
  await db.delete(store_category);
  await db.delete(store);
  /* eslint-enable drizzle/enforce-delete-with-where */
};

const seedStoreFixtures = async () => {
  const fixtures = await seedBaseFixtures();
  const produceCategoryId = Math.floor(Math.random() * 1_000_000_000);
  const freshSubcategoryId = produceCategoryId + 1;
  const cannedSubcategoryId = produceCategoryId + 2;

  await db.insert(category).values({
    id: produceCategoryId,
    name: "Produce",
  });
  await db.insert(subcategory).values([
    {
      id: freshSubcategoryId,
      name: "Fresh",
      categoryId: produceCategoryId,
    },
    {
      id: cannedSubcategoryId,
      name: "Canned",
      categoryId: produceCategoryId,
    },
  ]);

  return {
    ...fixtures,
    produceCategory: { id: produceCategoryId, name: "Produce" },
    freshSubcategory: {
      id: freshSubcategoryId,
      name: "Fresh",
      categoryId: produceCategoryId,
    },
    cannedSubcategory: {
      id: cannedSubcategoryId,
      name: "Canned",
      categoryId: produceCategoryId,
    },
  };
};

const createStoreForUser = async ({
  userId,
  name,
  isDefault = false,
}: {
  userId: string;
  name: string;
  isDefault?: boolean;
}) => {
  const id = await createNewStore({ userId, name, isDefault });
  const createdStore = await db.query.store.findFirst({
    where: eq(store.id, id),
    with: {
      store_categories: {
        with: {
          category: true,
          store_subcategories: {
            with: { subcategory: true },
          },
        },
      },
    },
  });
  return defined(createdStore);
};

beforeAll(() => {
  sideEffects.notFound = () => {
    sideEffectState.notFoundCalls += 1;
    throw new NotFoundSignal();
  };
  sideEffects.revalidatePath = (path: string) => {
    sideEffectState.revalidated.push(path);
  };
  sideEffects.addLog = async ({ action, userId }) => {
    sideEffectState.logs.push({ action, userId });
  };
  sideEffects.authorize = async () => {
    if (!sideEffectState.authorizedUser) {
      throw new Error("Test did not configure an authorized user");
    }
    return sideEffectState.authorizedUser;
  };
});

afterAll(() => {
  Object.assign(sideEffects, originalSideEffects);
});

beforeEach(async () => {
  resetSideEffects();
  await resetStoreTables();
  await resetRecipeTables();
});

describe("stores api", () => {
  test("addStore creates a store with category ordering rows", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);

    await addStore({
      name: "Corner Shop",
    });

    const createdStore = await db.query.store.findFirst({
      where: and(
        eq(store.userId, fixtures.user.id),
        eq(store.name, "Corner Shop"),
      ),
      with: {
        store_categories: {
          with: { store_subcategories: true },
        },
      },
    });
    const savedStore = defined(createdStore);
    const storeSubcategoryCount = savedStore.store_categories.reduce(
      (sum, row) => sum + row.store_subcategories.length,
      0,
    );

    expect(savedStore.slug).toBe("corner-shop");
    expect(savedStore.default).toBe(false);
    expect(savedStore.store_categories).toHaveLength(2);
    expect(storeSubcategoryCount).toBe(3);
    expect(sideEffectState.logs).toEqual([
      { action: "addStore", userId: fixtures.user.id },
    ]);
    expect(sideEffectState.revalidated).toEqual(["/stores"]);
  });

  test("getAllStores returns only current user's stores without userId", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Owned Store",
    });
    await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other Store",
    });

    const result = await getAllStores();
    const firstStore = defined(result[0]);

    expect(result).toHaveLength(1);
    expect(firstStore.id).toBe(owned.id);
    expect(firstStore.name).toBe("Owned Store");
    expect("userId" in firstStore).toBe(false);
  });

  test("getStoreById returns ordered categories and subcategories", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Ordered Store",
    });
    const pantryCategory = defined(
      owned.store_categories.find((row) => row.category.name === "Pantry"),
    );
    const produceCategory = defined(
      owned.store_categories.find((row) => row.category.name === "Produce"),
    );
    const freshSubcategory = defined(
      produceCategory.store_subcategories.find(
        (row) => row.subcategory.name === "Fresh",
      ),
    );
    const cannedSubcategory = defined(
      produceCategory.store_subcategories.find(
        (row) => row.subcategory.name === "Canned",
      ),
    );

    await db
      .update(store_category)
      .set({ order: 0 })
      .where(eq(store_category.id, produceCategory.id));
    await db
      .update(store_category)
      .set({ order: 1 })
      .where(eq(store_category.id, pantryCategory.id));
    await db
      .update(store_subcategory)
      .set({ order: 0 })
      .where(eq(store_subcategory.id, cannedSubcategory.id));
    await db
      .update(store_subcategory)
      .set({ order: 1 })
      .where(eq(store_subcategory.id, freshSubcategory.id));

    const result = await getStoreById({
      id: owned.id,
    });

    expect(result.store_categories.map((row) => row.category.name)).toEqual([
      "Produce",
      "Pantry",
    ]);
    expect(
      result.store_categories[0]?.store_subcategories.map(
        (row) => row.subcategory.name,
      ),
    ).toEqual(["Canned", "Fresh"]);
  });

  test("getStoreById calls notFound for another user's store", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const otherStore = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other Store",
    });

    await expectNotFound(
      getStoreById({
        id: otherStore.id,
      }),
    );
  });

  test("renameStore updates only the owned store", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Old Name",
    });
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other Name",
    });

    await renameStore({
      id: owned.id,
      name: "New Name",
    });
    await renameStore({
      id: other.id,
      name: "Leaked Name",
    });

    const updatedOwned = await db.query.store.findFirst({
      where: eq(store.id, owned.id),
    });
    const untouchedOther = await db.query.store.findFirst({
      where: eq(store.id, other.id),
    });

    expect(updatedOwned?.name).toBe("New Name");
    expect(untouchedOther?.name).toBe("Other Name");
    expect(sideEffectState.revalidated).toEqual(["/stores", "/stores"]);
  });

  test("setDefaultStore favorites one owned store and clears other owned defaults", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const first = await createStoreForUser({
      userId: fixtures.user.id,
      name: "First",
      isDefault: true,
    });
    const second = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Second",
    });
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other",
      isDefault: true,
    });

    await setDefaultStore({
      id: second.id,
    });

    const stores = await db.query.store.findMany({});
    const byId = new Map(stores.map((row) => [row.id, row]));

    expect(byId.get(first.id)?.default).toBe(false);
    expect(byId.get(second.id)?.default).toBe(true);
    expect(byId.get(other.id)?.default).toBe(true);
    expect(sideEffectState.revalidated).toEqual(["/stores"]);
  });

  test("setDefaultStore does not favorite another user's store", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Owned",
      isDefault: true,
    });
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other",
    });

    await setDefaultStore({
      id: other.id,
    });

    const ownedStore = await db.query.store.findFirst({
      where: eq(store.id, owned.id),
    });
    const otherStore = await db.query.store.findFirst({
      where: eq(store.id, other.id),
    });

    expect(ownedStore?.default).toBe(true);
    expect(otherStore?.default).toBe(false);
    expect(sideEffectState.revalidated).toEqual([]);
  });

  test("deleteStore deletes only the owned store and cascades ordering rows", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Owned",
    });
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other",
    });

    await deleteStore({
      id: owned.id,
      name: owned.name,
    });
    await deleteStore({
      id: other.id,
      name: other.name,
    });

    const deletedOwned = await db.query.store.findFirst({
      where: eq(store.id, owned.id),
    });
    const remainingOther = await db.query.store.findFirst({
      where: eq(store.id, other.id),
    });
    const ownedCategoryRows = await db.query.store_category.findMany({
      where: eq(store_category.storeId, owned.id),
    });
    const ownedSubcategoryRows = await db.query.store_subcategory.findMany({
      where: (model, { inArray }) =>
        inArray(
          model.store_categoryId,
          owned.store_categories.map((row) => row.id),
        ),
    });

    expect(deletedOwned).toBeUndefined();
    expect(remainingOther).toBeTruthy();
    expect(ownedCategoryRows).toHaveLength(0);
    expect(ownedSubcategoryRows).toHaveLength(0);
    expect(sideEffectState.revalidated).toEqual(["/stores", "/stores"]);
  });

  test("updateStoreOrder persists category order and moved subcategories", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Sortable",
    });
    const pantryCategory = defined(
      owned.store_categories.find((row) => row.category.name === "Pantry"),
    );
    const produceCategory = defined(
      owned.store_categories.find((row) => row.category.name === "Produce"),
    );
    const freshSubcategory = defined(
      produceCategory.store_subcategories.find(
        (row) => row.subcategory.name === "Fresh",
      ),
    );
    const cannedSubcategory = defined(
      produceCategory.store_subcategories.find(
        (row) => row.subcategory.name === "Canned",
      ),
    );

    await updateStoreOrder({
      storeId: owned.id,
      categories: [
        { ...produceCategory, order: 0 },
        { ...pantryCategory, order: 1 },
      ],
      subcategories: [
        { ...freshSubcategory, order: 0, categoryId: pantryCategory.id },
        { ...cannedSubcategory, order: 1, categoryId: produceCategory.id },
      ],
    });

    const updatedPantry = defined(
      await db.query.store_category.findFirst({
        where: eq(store_category.id, pantryCategory.id),
        with: { store_subcategories: { with: { subcategory: true } } },
      }),
    );
    const updatedProduce = defined(
      await db.query.store_category.findFirst({
        where: eq(store_category.id, produceCategory.id),
        with: { store_subcategories: { with: { subcategory: true } } },
      }),
    );
    const movedFresh = defined(
      updatedPantry.store_subcategories.find(
        (row) => row.subcategory.name === "Fresh",
      ),
    );

    expect(updatedProduce.order).toBe(0);
    expect(updatedPantry.order).toBe(1);
    expect(movedFresh.order).toBe(0);
    expect(movedFresh.store_categoryId).toBe(pantryCategory.id);
    expect(sideEffectState.revalidated).toEqual([
      `/stores/${owned.id}`,
      "/items",
    ]);
  });

  test("updateStoreOrder cannot mutate another user's store rows", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const owned = await createStoreForUser({
      userId: fixtures.user.id,
      name: "Owned",
    });
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other",
    });
    const otherCategory = defined(other.store_categories[0]);
    const otherSubcategory = defined(otherCategory.store_subcategories[0]);

    await updateStoreOrder({
      storeId: owned.id,
      categories: [{ ...otherCategory, order: 99 }],
      subcategories: [
        { ...otherSubcategory, order: 99, categoryId: otherCategory.id },
      ],
    });

    const untouchedCategory = await db.query.store_category.findFirst({
      where: eq(store_category.id, otherCategory.id),
    });
    const untouchedSubcategory = await db.query.store_subcategory.findFirst({
      where: eq(store_subcategory.id, otherSubcategory.id),
    });

    expect(untouchedCategory?.order).toBe(otherCategory.order);
    expect(untouchedSubcategory?.order).toBe(otherSubcategory.order);
    expect(untouchedSubcategory?.store_categoryId).toBe(otherCategory.id);
  });

  test("updateStoreOrder ignores another user's store id", async () => {
    const fixtures = await seedStoreFixtures();
    authorizeAs(fixtures.user);
    const other = await createStoreForUser({
      userId: fixtures.otherUser.id,
      name: "Other",
    });
    const otherCategory = defined(other.store_categories[0]);

    await updateStoreOrder({
      storeId: other.id,
      categories: [{ ...otherCategory, order: 99 }],
      subcategories: [],
    });

    const untouchedCategory = await db.query.store_category.findFirst({
      where: eq(store_category.id, otherCategory.id),
    });

    expect(untouchedCategory?.order).toBe(otherCategory.order);
    expect(sideEffectState.logs).toEqual([]);
    expect(sideEffectState.revalidated).toEqual([]);
  });
});
