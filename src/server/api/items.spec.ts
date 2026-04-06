import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { home, item_comment, items } from "~/server/db/schema";
import {
  createItemRow,
  insertRecipeGraph,
  resetRecipeTables,
  seedBaseFixtures,
} from "~/test/recipeTestHarness";
import type { MeilIngredient } from "~/types";
import {
  addComment,
  addItem,
  checkItems,
  deleteComment,
  getAllItems,
  removeCheckedItems,
  toggleHome,
  updateComment,
  updateItem,
} from "./items";
import { itemsSideEffects } from "./itemsSideEffects";

type IngredientSearchResult = Awaited<
  ReturnType<typeof itemsSideEffects.ingredientSearch>
>;

const originalSideEffects = { ...itemsSideEffects };
const sideEffectState: {
  revalidated: string[];
  logs: Array<{ action: string; userId: string }>;
  authorizeCalls: number;
  searches: string[];
} = {
  revalidated: [],
  logs: [],
  authorizeCalls: 0,
  searches: [],
};

const resetSideEffects = () => {
  sideEffectState.revalidated = [];
  sideEffectState.logs = [];
  sideEffectState.authorizeCalls = 0;
  sideEffectState.searches = [];
};

beforeAll(() => {
  itemsSideEffects.revalidatePath = (path: string) => {
    sideEffectState.revalidated.push(path);
  };
  itemsSideEffects.addLog = ({ action, userId }) => {
    sideEffectState.logs.push({ action, userId });
  };
  itemsSideEffects.authorize = async () => {
    sideEffectState.authorizeCalls += 1;
    return { id: "authorized-user", admin: false };
  };
  itemsSideEffects.ingredientSearch = async (search: string) => {
    sideEffectState.searches.push(search);
    const result: IngredientSearchResult = {
      hits: [
        {
          ingredientId: "ingredient-id",
          name: "Milk",
          category: "Pantry",
          subcategory: "Dairy",
        },
      ] satisfies MeilIngredient[],
      processingTimeMs: 0,
      query: search,
      offset: 0,
      limit: 20,
      estimatedTotalHits: 1,
    };
    return result;
  };
});

afterAll(() => {
  Object.assign(itemsSideEffects, originalSideEffects);
});

beforeEach(async () => {
  resetSideEffects();
  await resetRecipeTables();
});

describe("items api", () => {
  test("getAllItems returns ingredient metadata, first comment, and home status", async () => {
    const fixtures = await seedBaseFixtures();
    const recipeGraph = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Soup" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.flour.id,
              quantity: 1,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
    });
    const recipeItem = createItemRow(
      fixtures.user.id,
      fixtures.ingredients.flour.id,
      {
        menuId: null,
        recipeIngredientId: recipeGraph.ingredients[0]!.id,
        quantity: 2,
        unit: "dl",
      },
    );
    await db.insert(items).values(recipeItem);
    await db.insert(home).values({
      userId: fixtures.user.id,
      ingredientId: fixtures.ingredients.flour.id,
    });
    await db.insert(item_comment).values([
      { itemId: recipeItem.id, comment: "first comment" },
      { itemId: recipeItem.id, comment: "second comment" },
    ]);

    const result = await getAllItems({
      user: { id: fixtures.user.id, admin: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: recipeItem.id,
        quantity: 2,
        home: true,
        comments: expect.objectContaining({ comment: "first comment" }),
        ingredient: expect.objectContaining({
          name: "Flour",
          category: expect.objectContaining({ name: "Pantry" }),
          subcategory: expect.objectContaining({ name: "Baking" }),
        }),
      }),
    );
  });

  test("checkItems and removeCheckedItems only affect the current user's rows", async () => {
    const fixtures = await seedBaseFixtures();
    const owned = createItemRow(
      fixtures.user.id,
      fixtures.ingredients.flour.id,
      {
        checked: false,
      },
    );
    const other = createItemRow(
      fixtures.otherUser.id,
      fixtures.ingredients.flour.id,
      {
        checked: false,
      },
    );
    await db.insert(items).values([owned, other]);

    await checkItems({
      ids: [{ id: owned.id, checked: true, name: "Flour" }],
      user: { id: fixtures.user.id, admin: false },
    });

    const checkedOwned = await db.query.items.findFirst({
      where: eq(items.id, owned.id),
    });
    const uncheckedOther = await db.query.items.findFirst({
      where: eq(items.id, other.id),
    });

    expect(checkedOwned?.checked).toBe(true);
    expect(uncheckedOther?.checked).toBe(false);

    await removeCheckedItems({
      removable: [{ id: owned.id, name: "Flour" }],
      user: { id: fixtures.user.id, admin: false },
    });

    const remainingOwned = await db.query.items.findFirst({
      where: eq(items.id, owned.id),
    });
    const remainingOther = await db.query.items.findFirst({
      where: eq(items.id, other.id),
    });

    expect(remainingOwned).toBeUndefined();
    expect(remainingOther).toBeTruthy();
    expect(sideEffectState.revalidated).toEqual(["/items", "/items"]);
  });

  test("addItem inserts a non-recipe item and removes its home flag", async () => {
    const fixtures = await seedBaseFixtures();
    await db.insert(home).values({
      userId: fixtures.user.id,
      ingredientId: fixtures.ingredients.milk.id,
    });

    await addItem({
      item: {
        id: fixtures.ingredients.milk.id,
        quantity: 3,
        unit: "dl",
        name: "Milk",
      },
      user: { id: fixtures.user.id, admin: false },
    });

    const createdItems = await db.query.items.findMany({
      where: eq(items.userId, fixtures.user.id),
    });
    const homeRows = await db.query.home.findMany({
      where: eq(home.userId, fixtures.user.id),
    });

    expect(createdItems).toHaveLength(1);
    expect(createdItems[0]).toEqual(
      expect.objectContaining({
        ingredientId: fixtures.ingredients.milk.id,
        quantity: 3,
        unit: "dl",
        recipeIngredientId: null,
        menuId: null,
      }),
    );
    expect(homeRows).toHaveLength(0);
    expect(sideEffectState.revalidated).toEqual(["/items"]);
  });

  test("updateItem updates only the owned item", async () => {
    const fixtures = await seedBaseFixtures();
    const owned = createItemRow(
      fixtures.user.id,
      fixtures.ingredients.flour.id,
      {
        quantity: 1,
        unit: "dl",
      },
    );
    const other = createItemRow(
      fixtures.otherUser.id,
      fixtures.ingredients.flour.id,
      {
        quantity: 1,
        unit: "dl",
      },
    );
    await db.insert(items).values([owned, other]);

    await updateItem({
      item: {
        id: owned.id,
        ingredientId: fixtures.ingredients.salt.id,
        quantity: 4,
        unit: "tsk",
        name: "Salt",
      },
      user: { id: fixtures.user.id, admin: false },
    });

    const updatedOwned = await db.query.items.findFirst({
      where: eq(items.id, owned.id),
    });
    const untouchedOther = await db.query.items.findFirst({
      where: eq(items.id, other.id),
    });

    expect(updatedOwned).toEqual(
      expect.objectContaining({
        ingredientId: fixtures.ingredients.salt.id,
        quantity: 4,
        unit: "tsk",
      }),
    );
    expect(untouchedOther).toEqual(
      expect.objectContaining({
        ingredientId: fixtures.ingredients.flour.id,
        quantity: 1,
        unit: "dl",
      }),
    );
  });

  test("toggleHome adds and removes home rows for the current user", async () => {
    const fixtures = await seedBaseFixtures();

    await toggleHome({
      home: false,
      items: [{ id: fixtures.ingredients.flour.id, name: "Flour" }],
      user: { id: fixtures.user.id, admin: false },
    });

    let homeRows = await db.query.home.findMany({
      where: eq(home.userId, fixtures.user.id),
    });
    expect(homeRows).toHaveLength(1);
    expect(homeRows[0]?.ingredientId).toBe(fixtures.ingredients.flour.id);

    await toggleHome({
      home: true,
      items: [{ id: fixtures.ingredients.flour.id, name: "Flour" }],
      user: { id: fixtures.user.id, admin: false },
    });

    homeRows = await db.query.home.findMany({
      where: eq(home.userId, fixtures.user.id),
    });
    expect(homeRows).toHaveLength(0);
    expect(sideEffectState.revalidated).toEqual(["/items", "/items"]);
  });

  test("comment actions create, update, and delete item comments", async () => {
    const fixtures = await seedBaseFixtures();
    const owned = createItemRow(
      fixtures.user.id,
      fixtures.ingredients.flour.id,
    );
    await db.insert(items).values(owned);

    await addComment({
      comment: "first",
      item: { id: owned.id, name: "Flour" },
      user: { id: fixtures.user.id, admin: false },
    });

    const createdComment = await db.query.item_comment.findFirst({
      where: eq(item_comment.itemId, owned.id),
    });
    expect(createdComment?.comment).toBe("first");

    await updateComment({
      comment: "updated",
      commentId: createdComment!.id,
      name: "Flour",
      user: { id: fixtures.user.id, admin: false },
    });

    const updatedComment = await db.query.item_comment.findFirst({
      where: eq(item_comment.id, createdComment!.id),
    });
    expect(updatedComment?.comment).toBe("updated");
    expect(sideEffectState.authorizeCalls).toBe(1);

    await deleteComment({
      commentId: createdComment!.id,
      name: "Flour",
      user: { id: fixtures.user.id, admin: false },
    });

    const remainingComment = await db.query.item_comment.findFirst({
      where: eq(item_comment.id, createdComment!.id),
    });
    expect(remainingComment).toBeUndefined();
  });
});
