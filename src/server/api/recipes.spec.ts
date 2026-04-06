import { randomUUID } from "crypto";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  items,
  menu,
  recipe,
  recipe_group,
  recipe_ingredient,
} from "~/server/db/schema";
import type { MeilRecipe, RecipeFormSubmit, UpdateRecipe } from "~/types";
import {
  getRecipeItems,
  insertMenuWithItems,
  insertRecipeGraph,
  resetRecipeTables,
  seedBaseFixtures,
} from "~/test/recipeTestHarness";
import { addToMenu } from "./menu";
import { sideEffects } from "./sideEffects";
import {
  copyRecipe,
  createRecipe,
  getRecipeById,
  removeRecipe,
  updateRecipe,
} from "./recipes";

class RedirectSignal extends Error {
  constructor(readonly location: string) {
    super(`redirect:${location}`);
  }
}

class NotFoundSignal extends Error {
  constructor() {
    super("notFound");
  }
}

const originalSideEffects = { ...sideEffects };

const sideEffectState: {
  redirects: string[];
  notFoundCalls: number;
  searchAdds: MeilRecipe[];
  searchUpdates: MeilRecipe[];
  searchRemovals: string[];
  logs: Array<{ action: string; userId: string }>;
} = {
  redirects: [],
  notFoundCalls: 0,
  searchAdds: [],
  searchUpdates: [],
  searchRemovals: [],
  logs: [],
};

const resetSideEffects = () => {
  sideEffectState.redirects = [];
  sideEffectState.notFoundCalls = 0;
  sideEffectState.searchAdds = [];
  sideEffectState.searchUpdates = [];
  sideEffectState.searchRemovals = [];
  sideEffectState.logs = [];
};

const expectRedirect = async (action: Promise<unknown>, location: string) => {
  const error = await action.catch((reason) => reason);
  expect(error).toBeInstanceOf(RedirectSignal);
  expect((error as RedirectSignal).location).toBe(location);
  expect(sideEffectState.redirects).toEqual([location]);
};

const expectNotFound = async (action: Promise<unknown>) => {
  const error = await action.catch((reason) => reason);
  expect(error).toBeInstanceOf(NotFoundSignal);
  expect(sideEffectState.notFoundCalls).toBe(1);
};

const defined = <T>(value: T | undefined): T => {
  expect(value).toBeDefined();
  return value as T;
};

const getItemByRecipeIngredientId = async (
  menuId: string,
  recipeIngredientId: string,
) =>
  (await getRecipeItems(menuId)).find(
    (item) => item.recipeIngredientId === recipeIngredientId,
  );

beforeAll(() => {
  sideEffects.revalidatePath = () => {};
  sideEffects.redirect = (location: string) => {
    sideEffectState.redirects.push(location);
    throw new RedirectSignal(location);
  };
  sideEffects.notFound = () => {
    sideEffectState.notFoundCalls += 1;
    throw new NotFoundSignal();
  };
  sideEffects.addSearchDocument = async (document: MeilRecipe) => {
    sideEffectState.searchAdds.push(document);
  };
  sideEffects.updateSearchDocument = async (document: MeilRecipe) => {
    sideEffectState.searchUpdates.push(document);
  };
  sideEffects.removeSearchDocument = async (id: string) => {
    sideEffectState.searchRemovals.push(id);
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

describe("getRecipeById", () => {
  test("returns nested recipe data in order and sets yours based on the viewer", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Child Recipe", quantity: 2, unit: "port" },
      groups: [
        {
          name: "Child Group",
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
      recipe: { name: "Main Recipe" },
      groups: [
        {
          name: "Second Group",
          order: 1,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.pepper.id,
              quantity: 2,
              unit: "krm",
              order: 1,
            },
            {
              ingredientId: fixtures.ingredients.milk.id,
              quantity: 1,
              unit: "dl",
              order: 0,
            },
          ],
        },
        {
          name: "First Group",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.flour.id,
              quantity: 3,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 1 }],
    });

    const owned = await getRecipeById({
      id: main.recipe.id,
      user: { id: fixtures.user.id, admin: false },
    });
    const shared = await getRecipeById({
      id: main.recipe.id,
      user: { id: fixtures.otherUser.id, admin: false },
    });

    expect(owned.yours).toBe(true);
    expect(shared.yours).toBe(false);
    expect(owned.groups.map((group) => group.name)).toEqual([
      "First Group",
      "Second Group",
    ]);
    expect(
      owned.groups[1]?.ingredients.map((ingredient) => ingredient.order),
    ).toEqual([0, 1]);
    expect(owned.contained).toEqual([
      expect.objectContaining({
        recipeId: child.recipe.id,
        quantity: 1,
        name: "Child Recipe",
        unit: "port",
      }),
    ]);
  });

  test("throws notFound for missing recipes", async () => {
    await seedBaseFixtures();

    await expectNotFound(
      getRecipeById({
        id: randomUUID(),
        user: { id: randomUUID(), admin: false },
      }),
    );
  });
});

describe("createRecipe", () => {
  test("persists the recipe graph, indexes it, and redirects", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Filling" },
      groups: [
        {
          name: "Inside",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.cheese.id,
              quantity: 1,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
    });

    const recipeId = randomUUID();
    const groupId = randomUUID();
    const ingredientId = randomUUID();
    const payload: RecipeFormSubmit & { user: { id: string; admin: boolean } } =
      {
        user: { id: fixtures.user.id, admin: false },
        id: recipeId,
        name: "Lasagna",
        quantity: 6,
        unit: "port",
        instruction: "Layer and bake.",
        isPublic: true,
        groups: [
          {
            id: groupId,
            name: "Base",
            order: 0,
            recipeId,
            ingredients: [
              {
                id: ingredientId,
                ingredientId: fixtures.ingredients.flour.id,
                groupId,
                quantity: 2,
                unit: "dl",
                order: 0,
                ingredient: { name: "Flour" },
              },
              {
                id: randomUUID(),
                ingredientId: fixtures.ingredients.milk.id,
                groupId,
                quantity: 3,
                unit: "dl",
                order: 1,
                ingredient: { name: "Milk" },
              },
            ],
          },
        ],
        contained: [
          { id: randomUUID(), recipeId: child.recipe.id, quantity: 2 },
        ],
      };

    await expectRedirect(createRecipe(payload), `/recipes/${recipeId}`);

    const created = await db.query.recipe.findFirst({
      where: eq(recipe.id, recipeId),
      with: {
        groups: { with: { ingredients: true } },
        contained: true,
      },
    });

    expect(created).toBeTruthy();
    expect(created?.groups).toHaveLength(1);
    expect(created?.groups[0]?.ingredients).toHaveLength(2);
    expect(created?.contained).toEqual([
      expect.objectContaining({
        recipeId: child.recipe.id,
        quantity: 2,
      }),
    ]);
    expect(sideEffectState.searchAdds).toEqual([
      expect.objectContaining({
        id: recipeId,
        name: "Lasagna",
        ingredients: ["Flour", "Milk"],
        isPublic: true,
        userId: fixtures.user.id,
      }),
    ]);
  });
});

describe("updateRecipe", () => {
  test("updates fields, groups, ingredients, linked items, and parent menu additions without contained resync", async () => {
    const fixtures = await seedBaseFixtures();
    const main = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: {
        name: "Soup",
        quantity: 4,
        unit: "port",
        instruction: "Old instructions",
      },
      groups: [
        {
          name: "Editable",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.flour.id,
              quantity: 2,
              unit: "dl",
              order: 0,
            },
          ],
        },
        {
          name: "Remove Me",
          order: 1,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.butter.id,
              quantity: 1,
              unit: "msk",
              order: 0,
            },
          ],
        },
      ],
    });
    const parent = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Dinner" },
      groups: [
        {
          name: "Parent",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.egg.id,
              quantity: 1,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: main.recipe.id, quantity: 1 }],
    });

    const editableIngredient = main.ingredients[0]!;
    const removedIngredient = main.ingredients[1]!;
    const editableGroup = main.groups[0]!;
    const removedGroup = main.groups[1]!;
    const mainMenu = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: main.recipe.id,
      quantity: 1,
      itemRows: [
        {
          ingredientId: editableIngredient.ingredientId,
          recipeIngredientId: editableIngredient.id,
          quantity: editableIngredient.quantity,
          unit: editableIngredient.unit,
        },
        {
          ingredientId: removedIngredient.ingredientId,
          recipeIngredientId: removedIngredient.id,
          quantity: removedIngredient.quantity,
          unit: removedIngredient.unit,
        },
      ],
    });
    const parentMenu = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: parent.recipe.id,
      quantity: 1,
      itemRows: [
        {
          ingredientId: editableIngredient.ingredientId,
          recipeIngredientId: editableIngredient.id,
          quantity: editableIngredient.quantity,
          unit: editableIngredient.unit,
        },
        {
          ingredientId: removedIngredient.ingredientId,
          recipeIngredientId: removedIngredient.id,
          quantity: removedIngredient.quantity,
          unit: removedIngredient.unit,
        },
      ],
    });

    const addedGroupId = randomUUID();
    const addedSaltIngredientId = randomUUID();
    const addedEggIngredientId = randomUUID();
    const payload: UpdateRecipe & { user: { id: string; admin: boolean } } = {
      user: { id: fixtures.user.id, admin: false },
      recipe: {
        id: main.recipe.id,
        name: "Soup Deluxe",
        quantity: 8,
        unit: "port",
        instruction: "New instructions",
        isPublic: true,
      },
      groups: {
        edited: [{ id: editableGroup.id, name: "Editable Updated", order: 1 }],
        removed: [removedGroup.id],
        added: [{ id: addedGroupId, name: "Sauce", order: 0 }],
      },
      ingredients: {
        edited: [
          {
            id: editableIngredient.id,
            quantity: 3,
            unit: "msk",
            order: 1,
            groupId: editableGroup.id,
            ingredientId: fixtures.ingredients.pepper.id,
          },
        ],
        removed: [removedIngredient.id],
        added: [
          {
            id: addedSaltIngredientId,
            quantity: 0.5,
            unit: "tsk",
            order: 2,
            groupId: editableGroup.id,
            ingredientId: fixtures.ingredients.salt.id,
          },
          {
            id: addedEggIngredientId,
            quantity: 2,
            unit: "st",
            order: 0,
            groupId: addedGroupId,
            ingredientId: fixtures.ingredients.egg.id,
          },
        ],
      },
      contained: { edited: [], removed: [], added: [] },
    };

    await expectRedirect(updateRecipe(payload), `/recipes/${main.recipe.id}`);

    const updatedRecipeRow = await db.query.recipe.findFirst({
      where: eq(recipe.id, main.recipe.id),
    });
    const updatedGroups = await db.query.recipe_group.findMany({
      where: eq(recipe_group.recipeId, main.recipe.id),
      orderBy: (group, { asc }) => [asc(group.order)],
    });
    const updatedIngredients = await db.query.recipe_ingredient.findMany({
      where: inArray(
        recipe_ingredient.groupId,
        updatedGroups.map((group) => group.id),
      ),
      orderBy: (ingredientRow, { asc }) => [asc(ingredientRow.order)],
    });
    const editedItems = await db.query.items.findMany({
      where: eq(items.recipeIngredientId, editableIngredient.id),
      orderBy: (item, { asc }) => [asc(item.menuId)],
    });
    const removedItems = await db.query.items.findMany({
      where: eq(items.recipeIngredientId, removedIngredient.id),
    });
    const mainMenuItems = await getRecipeItems(mainMenu.id);
    const parentMenuItems = await getRecipeItems(parentMenu.id);

    expect(updatedRecipeRow).toEqual(
      expect.objectContaining({
        name: "Soup Deluxe",
        quantity: 8,
        unit: "port",
        instruction: "New instructions",
        isPublic: true,
      }),
    );
    expect(updatedGroups.map((group) => group.name)).toEqual([
      "Sauce",
      "Editable Updated",
    ]);
    expect(updatedIngredients).toHaveLength(3);
    expect(editedItems).toHaveLength(2);
    expect(editedItems.every((item) => item.quantity === 3)).toBe(true);
    expect(editedItems.every((item) => item.unit === "msk")).toBe(true);
    expect(
      editedItems.every(
        (item) => item.ingredientId === fixtures.ingredients.pepper.id,
      ),
    ).toBe(true);
    expect(removedItems).toHaveLength(0);
    const addedIngredientIds = new Set<string>([
      addedSaltIngredientId,
      addedEggIngredientId,
    ]);
    expect(
      mainMenuItems.filter(
        (item) =>
          item.recipeIngredientId !== null &&
          addedIngredientIds.has(item.recipeIngredientId),
      ),
    ).toHaveLength(2);
    expect(
      parentMenuItems.filter(
        (item) =>
          item.recipeIngredientId !== null &&
          addedIngredientIds.has(item.recipeIngredientId),
      ),
    ).toHaveLength(2);
    expect(sideEffectState.searchUpdates).toEqual([
      expect.objectContaining({
        id: main.recipe.id,
        name: "Soup Deluxe",
        ingredients: expect.arrayContaining(["Pepper", "Salt", "Egg"]),
      }),
    ]);
  });

  test("rescales linked menu items when contained recipes change", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Sauce" },
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
      recipe: { name: "Pasta", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.milk.id,
              quantity: 1,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 1 }],
    });
    const parent = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Dinner", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Parent",
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
      contained: [{ recipeId: main.recipe.id, quantity: 1 }],
    });

    const childIngredient = child.ingredients[0]!;
    const mainIngredient = main.ingredients[0]!;
    const parentIngredient = parent.ingredients[0]!;
    const childRelation = main.contained[0]!;

    const mainMenu = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: main.recipe.id,
      itemRows: [
        {
          ingredientId: mainIngredient.ingredientId,
          recipeIngredientId: mainIngredient.id,
          quantity: 1,
          unit: "dl",
        },
        {
          ingredientId: childIngredient.ingredientId,
          recipeIngredientId: childIngredient.id,
          quantity: 1,
          unit: "tsk",
        },
      ],
    });
    const parentMenu = await insertMenuWithItems({
      userId: fixtures.user.id,
      recipeId: parent.recipe.id,
      itemRows: [
        {
          ingredientId: parentIngredient.ingredientId,
          recipeIngredientId: parentIngredient.id,
          quantity: 1,
          unit: "dl",
        },
        {
          ingredientId: mainIngredient.ingredientId,
          recipeIngredientId: mainIngredient.id,
          quantity: 1,
          unit: "dl",
        },
        {
          ingredientId: childIngredient.ingredientId,
          recipeIngredientId: childIngredient.id,
          quantity: 1,
          unit: "tsk",
        },
      ],
    });

    const payload: UpdateRecipe & { user: { id: string; admin: boolean } } = {
      user: { id: fixtures.user.id, admin: false },
      recipe: {
        id: main.recipe.id,
        name: "Pasta",
        quantity: 1,
        unit: "port",
        instruction: main.recipe.instruction,
        isPublic: false,
      },
      groups: { edited: [], removed: [], added: [] },
      ingredients: { edited: [], removed: [], added: [] },
      contained: {
        edited: [
          {
            id: childRelation.id,
            recipeId: child.recipe.id,
            quantity: 2,
          },
        ],
        removed: [],
        added: [],
      },
    };

    await expectRedirect(updateRecipe(payload), `/recipes/${main.recipe.id}`);

    const mainMenuItems = await getRecipeItems(mainMenu.id);
    const parentMenuItems = await getRecipeItems(parentMenu.id);
    const mainChildItem = mainMenuItems.find(
      (item) => item.recipeIngredientId === childIngredient.id,
    );
    const parentChildItem = parentMenuItems.find(
      (item) => item.recipeIngredientId === childIngredient.id,
    );
    const mainOwnItem = mainMenuItems.find(
      (item) => item.recipeIngredientId === mainIngredient.id,
    );
    const parentOwnItem = parentMenuItems.find(
      (item) => item.recipeIngredientId === parentIngredient.id,
    );

    expect(mainMenuItems).toHaveLength(2);
    expect(parentMenuItems).toHaveLength(3);
    expect(mainChildItem?.quantity).toBe(0.5);
    expect(parentChildItem?.quantity).toBe(0.5);
    expect(mainOwnItem?.quantity).toBe(1);
    expect(parentOwnItem?.quantity).toBe(1);
    expect(sideEffectState.searchUpdates).toEqual([
      expect.objectContaining({
        id: main.recipe.id,
        ingredients: ["Milk"],
      }),
    ]);
  });

  test("resyncs direct and ancestor menu rows when a child quantity changes", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Recipe B", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Child",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.tomato.id,
              quantity: 2,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
    });
    const main = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Recipe A", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Main",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.egg.id,
              quantity: 1,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 1 }],
    });
    const parent = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Recipe C", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Parent",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.flour.id,
              quantity: 3,
              unit: "dl",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: main.recipe.id, quantity: 1 }],
    });

    await addToMenu({
      id: main.recipe.id,
      user: { id: fixtures.user.id, admin: false },
    });
    await addToMenu({
      id: parent.recipe.id,
      user: { id: fixtures.user.id, admin: false },
    });

    const mainMenu = defined(
      await db.query.menu.findFirst({
        where: eq(menu.recipeId, main.recipe.id),
      }),
    );
    const parentMenu = defined(
      await db.query.menu.findFirst({
        where: eq(menu.recipeId, parent.recipe.id),
      }),
    );
    const childRelation = main.contained[0]!;
    const childIngredient = child.ingredients[0]!;

    expect(
      (await getItemByRecipeIngredientId(mainMenu.id, childIngredient.id))
        ?.quantity,
    ).toBe(2);
    expect(
      (await getItemByRecipeIngredientId(parentMenu.id, childIngredient.id))
        ?.quantity,
    ).toBe(2);

    await expectRedirect(
      updateRecipe({
        user: { id: fixtures.user.id, admin: false },
        recipe: {
          id: main.recipe.id,
          name: main.recipe.name,
          quantity: main.recipe.quantity,
          unit: main.recipe.unit,
          instruction: main.recipe.instruction,
          isPublic: main.recipe.isPublic,
        },
        groups: { edited: [], removed: [], added: [] },
        ingredients: { edited: [], removed: [], added: [] },
        contained: {
          edited: [
            {
              id: childRelation.id,
              recipeId: child.recipe.id,
              quantity: 2,
            },
          ],
          removed: [],
          added: [],
        },
      }),
      `/recipes/${main.recipe.id}`,
    );

    expect(
      (await getItemByRecipeIngredientId(mainMenu.id, childIngredient.id))
        ?.quantity,
    ).toBe(4);
    expect(
      (await getItemByRecipeIngredientId(parentMenu.id, childIngredient.id))
        ?.quantity,
    ).toBe(4);
  });

  test("adds and removes child-derived items during contained recipe resync", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Topping", quantity: 1, unit: "port" },
      groups: [
        {
          name: "Child",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.cheese.id,
              quantity: 2,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
    });
    const main = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Base", quantity: 1, unit: "port" },
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

    await addToMenu({
      id: main.recipe.id,
      user: { id: fixtures.user.id, admin: false },
    });

    const menuRow = defined(
      await db.query.menu.findFirst({
        where: eq(menu.recipeId, main.recipe.id),
      }),
    );
    const childLinkId = randomUUID();

    await expectRedirect(
      updateRecipe({
        user: { id: fixtures.user.id, admin: false },
        recipe: {
          id: main.recipe.id,
          name: main.recipe.name,
          quantity: main.recipe.quantity,
          unit: main.recipe.unit,
          instruction: main.recipe.instruction,
          isPublic: main.recipe.isPublic,
        },
        groups: { edited: [], removed: [], added: [] },
        ingredients: { edited: [], removed: [], added: [] },
        contained: {
          edited: [],
          removed: [],
          added: [{ id: childLinkId, recipeId: child.recipe.id, quantity: 1 }],
        },
      }),
      `/recipes/${main.recipe.id}`,
    );

    expect(
      (await getItemByRecipeIngredientId(menuRow.id, child.ingredients[0]!.id))
        ?.quantity,
    ).toBe(2);
    resetSideEffects();

    await expectRedirect(
      updateRecipe({
        user: { id: fixtures.user.id, admin: false },
        recipe: {
          id: main.recipe.id,
          name: main.recipe.name,
          quantity: main.recipe.quantity,
          unit: main.recipe.unit,
          instruction: main.recipe.instruction,
          isPublic: main.recipe.isPublic,
        },
        groups: { edited: [], removed: [], added: [] },
        ingredients: { edited: [], removed: [], added: [] },
        contained: {
          edited: [],
          removed: [childLinkId],
          added: [],
        },
      }),
      `/recipes/${main.recipe.id}`,
    );

    expect(
      await getItemByRecipeIngredientId(menuRow.id, child.ingredients[0]!.id),
    ).toBeUndefined();
  });
});

describe("removeRecipe", () => {
  test("deletes only the current user's recipe, removes the search document, and redirects", async () => {
    const fixtures = await seedBaseFixtures();
    const owned = await insertRecipeGraph({
      userId: fixtures.user.id,
      recipe: { name: "Owned Recipe" },
      groups: [
        {
          name: "Group",
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
      recipe: { name: "Other Recipe" },
      groups: [
        {
          name: "Group",
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

    await expectRedirect(
      removeRecipe({
        id: owned.recipe.id,
        user: { id: fixtures.user.id, admin: false },
        name: owned.recipe.name,
      }),
      "/recipes",
    );

    const remainingOwned = await db.query.recipe.findFirst({
      where: eq(recipe.id, owned.recipe.id),
    });
    const remainingOther = await db.query.recipe.findFirst({
      where: eq(recipe.id, other.recipe.id),
    });

    expect(remainingOwned).toBeUndefined();
    expect(remainingOther).toBeTruthy();
    expect(sideEffectState.searchRemovals).toEqual([owned.recipe.id]);
  });
});

describe("copyRecipe", () => {
  test("copies a recipe tree with fresh ids for the target user", async () => {
    const fixtures = await seedBaseFixtures();
    const child = await insertRecipeGraph({
      userId: fixtures.otherUser.id,
      recipe: { name: "Child Copy", quantity: 2, unit: "port" },
      groups: [
        {
          name: "Child Group",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.cheese.id,
              quantity: 1,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
    });
    const parent = await insertRecipeGraph({
      userId: fixtures.otherUser.id,
      recipe: { name: "Parent Copy", quantity: 4, unit: "port" },
      groups: [
        {
          name: "Parent Group",
          order: 0,
          ingredients: [
            {
              ingredientId: fixtures.ingredients.tomato.id,
              quantity: 2,
              unit: "st",
              order: 0,
            },
          ],
        },
      ],
      contained: [{ recipeId: child.recipe.id, quantity: 3 }],
    });

    const copyError = await copyRecipe({
      id: parent.recipe.id,
      user: { id: fixtures.user.id, admin: false },
      name: parent.recipe.name,
    }).catch((reason) => reason);

    const copiedRecipes = await db.query.recipe.findMany({
      where: eq(recipe.userId, fixtures.user.id),
      with: {
        groups: { with: { ingredients: true } },
        contained: true,
      },
    });

    expect(copiedRecipes).toHaveLength(2);
    expect(copiedRecipes.map((row) => row.name).sort()).toEqual([
      "Child Copy",
      "Parent Copy",
    ]);
    expect(
      copiedRecipes.every(
        (row) => row.id !== parent.recipe.id && row.id !== child.recipe.id,
      ),
    ).toBe(true);

    const copiedParent = defined(
      copiedRecipes.find((row) => row.name === "Parent Copy"),
    );
    const copiedChild = defined(
      copiedRecipes.find((row) => row.name === "Child Copy"),
    );
    expect(copyError).toBeInstanceOf(RedirectSignal);
    expect(copiedParent.contained).toEqual([
      expect.objectContaining({
        recipeId: copiedChild.id,
        quantity: 3,
      }),
    ]);
    expect(sideEffectState.searchAdds).toHaveLength(2);
    expect(sideEffectState.redirects).toHaveLength(1);
    expect(sideEffectState.redirects[0]).toBe(`/recipes/${copiedParent.id}`);
  });
});
