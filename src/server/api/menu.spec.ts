import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { items, menu } from "~/server/db/schema";
import {
  getRecipeItems,
  insertMenuWithItems,
  insertRecipeGraph,
  resetRecipeTables,
  seedBaseFixtures,
} from "~/test/recipeTestHarness";
import {
  addToMenu,
  getMenu,
  getMenuItemById,
  removeMenuItem,
  updateMenuDate,
  updateMenuQuantity,
} from "./menu";
import { sideEffects } from "./sideEffects";

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
} = {
  notFoundCalls: 0,
  revalidated: [],
  logs: [],
};

const resetSideEffects = () => {
  sideEffectState.notFoundCalls = 0;
  sideEffectState.revalidated = [];
  sideEffectState.logs = [];
};

const expectNotFound = async (action: Promise<unknown>) => {
  const error = await action.catch((reason) => reason);
  expect(error).toBeInstanceOf(NotFoundSignal);
  expect(sideEffectState.notFoundCalls).toBe(1);
};

beforeAll(() => {
  sideEffects.notFound = () => {
    sideEffectState.notFoundCalls += 1;
    throw new NotFoundSignal();
  };
  sideEffects.revalidatePath = (path: string) => {
    sideEffectState.revalidated.push(path);
  };
  sideEffects.addLog = ({ action, userId }) => {
    sideEffectState.logs.push({ action, userId });
  };
});

afterAll(() => {
  Object.assign(sideEffects, originalSideEffects);
});

beforeEach(async () => {
  resetSideEffects();
  await resetRecipeTables();
});

describe("menu api", () => {
  test("getMenu returns only the current user's menu rows with recipe metadata", async () => {
    const fixtures = await seedBaseFixtures();
    const owned = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Owned", unit: "port" },
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
    const other = await insertRecipeGraph({
      userId: fixtures.otherUser.id,
      recipe: { name: "Other", unit: "port" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.salt.id,
              quantity: 1,
              unit: "tsk",
              order: 0,
            },
          ],
        },
      ],
    });

    await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: owned.recipe.id,
      itemRows: [],
    });
    await insertMenuWithItems({
      userId: fixtures.otherUser.id,
      recipeId: other.recipe.id,
      itemRows: [],
    });

    const result = await getMenu({ id: fixtures.user.id, admin: false });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        userId: fixtures.user.id,
        recipeId: owned.recipe.id,
        recipe: { name: "Owned", unit: "port" },
      }),
    );
  });

  test("addToMenu creates a menu row and scaled item rows for nested recipes", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Sauce", quantity: 2, unit: "port" },
      groups: [
        {
          name: "Child",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.salt.id,
              quantity: 1,
              unit: "tsk",
              order: 0,
            },
          ],
        },
      ],
    });
    const main = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Pasta", quantity: 4, unit: "port" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.milk.id,
              quantity: 2,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 1 }],
    });

    await addToMenu({
      id: main.recipe.id,
      quantity: 8,
      user: { id: fixtures.user.id, admin: false },
    });

    const createdMenu = await db.query.menu.findFirst({
      where: eq(menu.recipeId, main.recipe.id),
    });
    const createdItems = await getRecipeItems(createdMenu!.id);

    expect(createdMenu).toEqual(
      expect.objectContaining({
        recipeId: main.recipe.id,
        quantity: 8,
        userId: fixtures.user.id,
      }),
    );
    expect(createdItems).toHaveLength(2);
    expect(createdItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipeIngredientId: main.ingredients[0]!.id,
          quantity: 4,
          unit: "dl",
        }),
        expect.objectContaining({
          recipeIngredientId: child.ingredients[0]!.id,
          quantity: 1,
          unit: "tsk",
        }),
      ]),
    );
    expect(sideEffectState.revalidated).toEqual(["/menu"]);
  });

  test("addToMenu throws notFound when the recipe is not owned by the user", async () => {
    const fixtures = await seedBaseFixtures();
    const otherRecipe = await insertRecipeGraph({
      userId: fixtures.otherUser.id,
      recipe: { name: "Other" },
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

    await expectNotFound(
      addToMenu({
        id: otherRecipe.recipe.id,
        user: { id: fixtures.user.id, admin: false },
      }),
    );
  });

  test("updateMenuQuantity rescales item rows and revalidates menu and items", async () => {
    const fixtures = await seedBaseFixtures();
    const graph = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Soup", quantity: 2, unit: "port" },
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
            {
              ingredientId: fixtures.ingredients.salt.id,
              quantity: 2,
              unit: "tsk",
              order: 1,
            },
          ],
        },
      ],
    });
    const menuRow = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: graph.recipe.id,
      quantity: 2,
      itemRows: [
        {
          ingredientId: graph.ingredients[0]!.ingredientId,
          recipeIngredientId: graph.ingredients[0]!.id,
          quantity: 1,
          unit: "dl",
        },
        {
          ingredientId: graph.ingredients[1]!.ingredientId,
          recipeIngredientId: graph.ingredients[1]!.id,
          quantity: 2,
          unit: "tsk",
        },
      ],
    });

    await updateMenuQuantity({
      id: menuRow.id,
      quantity: 6,
      user: { id: fixtures.user.id, admin: false },
    });

    const updatedMenu = await db.query.menu.findFirst({
      where: eq(menu.id, menuRow.id),
    });
    const updatedItems = await getRecipeItems(menuRow.id);

    expect(updatedMenu?.quantity).toBe(6);
    expect(updatedItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipeIngredientId: graph.ingredients[0]!.id,
          quantity: 3,
        }),
        expect.objectContaining({
          recipeIngredientId: graph.ingredients[1]!.id,
          quantity: 6,
        }),
      ]),
    );
    expect(sideEffectState.revalidated).toEqual(["/menu", "/items"]);
  });

  test("getMenuItemById returns rescaled recipe trees for the selected menu row", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Sauce", quantity: 2, unit: "port" },
      groups: [
        {
          name: "Child",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.salt.id,
              quantity: 1,
              unit: "tsk",
              order: 0,
            },
          ],
        },
      ],
    });
    const main = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Pasta", quantity: 4, unit: "port" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.milk.id,
              quantity: 2,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 1 }],
    });
    const menuRow = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: main.recipe.id,
      quantity: 8,
      itemRows: [],
    });

    const result = await getMenuItemById({
      id: menuRow.id,
      user: { id: fixtures.user.id, admin: false },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: main.recipe.id,
        quantity: 8,
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        id: child.recipe.id,
        quantity: 2,
      }),
    );
  });

  test("removeMenuItem deletes the owned menu row and cascades recipe items", async () => {
    const fixtures = await seedBaseFixtures();
    const graph = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Owned" },
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
    const menuRow = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: graph.recipe.id,
      itemRows: [
        {
          ingredientId: graph.ingredients[0]!.ingredientId,
          recipeIngredientId: graph.ingredients[0]!.id,
          quantity: 1,
          unit: "dl",
        },
      ],
    });

    await removeMenuItem({
      id: menuRow.id,
      name: graph.recipe.name,
      user: { id: fixtures.user.id, admin: false },
    });

    const remainingMenu = await db.query.menu.findFirst({
      where: eq(menu.id, menuRow.id),
    });
    const remainingItems = await db.query.items.findMany({
      where: eq(items.menuId, menuRow.id),
    });

    expect(remainingMenu).toBeUndefined();
    expect(remainingItems).toHaveLength(0);
    expect(sideEffectState.revalidated).toEqual(["/menu"]);
  });

  test("updateMenuDate updates the owned row date", async () => {
    const fixtures = await seedBaseFixtures();
    const graph = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Date Recipe" },
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
    const menuRow = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: graph.recipe.id,
      itemRows: [],
    });

    await updateMenuDate({
      id: menuRow.id,
      day: "2026-04-07",
      name: graph.recipe.name,
      user: { id: fixtures.user.id, admin: false },
    });

    const updated = await db.query.menu.findFirst({
      where: eq(menu.id, menuRow.id),
    });

    expect(updated?.day).toBe("2026-04-07");
    expect(sideEffectState.revalidated).toEqual(["/menu"]);
  });
});
