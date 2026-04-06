import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~/server/db";
import {
  category,
  ingredient,
  items,
  menu,
  recipe,
  recipe_group,
  recipe_ingredient,
  recipe_recipe,
  subcategory,
  users,
} from "~/server/db/schema";
import type { Unit } from "~/types";

type UserRow = InferInsertModel<typeof users> & {
  id: string;
  authId: string;
  email: string;
  name: string;
};
type CategoryRow = InferInsertModel<typeof category>;
type SubcategoryRow = InferInsertModel<typeof subcategory>;
type IngredientRow = InferInsertModel<typeof ingredient> & {
  id: string;
  name: string;
  categoryId: number;
  subcategoryId: number;
};
type RecipeRow = InferInsertModel<typeof recipe> & {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  instruction: string;
  isPublic: boolean;
  userId: string;
};
type RecipeGroupRow = InferInsertModel<typeof recipe_group> & {
  id: string;
  name: string;
  order: number;
  recipeId: string;
};
type RecipeIngredientRow = InferInsertModel<typeof recipe_ingredient> & {
  id: string;
  quantity: number;
  unit: Unit;
  order: number;
  groupId: string;
  ingredientId: string;
};
type RecipeRecipeRow = InferInsertModel<typeof recipe_recipe> & {
  id: string;
  quantity: number;
  containerId: string;
  recipeId: string;
};
type MenuRow = InferInsertModel<typeof menu> & {
  id: string;
  quantity: number;
  userId: string;
  recipeId: string;
};
type ItemRow = InferInsertModel<typeof items> & {
  id: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
  userId: string;
  ingredientId: string;
  recipeIngredientId: string | null;
  menuId: string | null;
};

type IngredientKey =
  | "flour"
  | "milk"
  | "salt"
  | "pepper"
  | "butter"
  | "egg"
  | "tomato"
  | "cheese";

type GroupInput = {
  id?: string;
  name: string;
  order: number;
  ingredients: Array<{
    id?: string;
    ingredientId: string;
    quantity: number;
    unit: Unit;
    order: number;
  }>;
};

export type RecipeGraph = {
  recipe: RecipeRow;
  groups: RecipeGroupRow[];
  ingredients: RecipeIngredientRow[];
  contained: RecipeRecipeRow[];
};

export type BaseFixtures = {
  user: UserRow;
  otherUser: UserRow;
  category: CategoryRow;
  subcategory: SubcategoryRow;
  ingredients: Record<IngredientKey, IngredientRow>;
};

export const createUser = (overrides: Partial<UserRow> = {}): UserRow => ({
  id: randomUUID(),
  authId: randomUUID(),
  email: `${randomUUID()}@example.com`,
  name: "Test User",
  image: null,
  ...overrides,
});

export const createRecipeRow = (
  userId: string,
  overrides: Partial<RecipeRow> = {},
): RecipeRow => {
  const row: RecipeRow = {
    id: randomUUID(),
    name: "Recipe",
    quantity: 4,
    unit: "port",
    instruction: "Mix well.",
    isPublic: false,
    userId,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const createGroupRow = (
  recipeId: string,
  overrides: Partial<RecipeGroupRow> = {},
): RecipeGroupRow => {
  const row: RecipeGroupRow = {
    id: randomUUID(),
    name: "Main",
    order: 0,
    recipeId,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const createRecipeIngredientRow = (
  groupId: string,
  ingredientId: string,
  overrides: Partial<RecipeIngredientRow> = {},
): RecipeIngredientRow => {
  const row: RecipeIngredientRow = {
    id: randomUUID(),
    groupId,
    ingredientId,
    quantity: 1,
    unit: "st",
    order: 0,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const createContainedRecipeRow = (
  containerId: string,
  recipeId: string,
  overrides: Partial<RecipeRecipeRow> = {},
): RecipeRecipeRow => {
  const row: RecipeRecipeRow = {
    id: randomUUID(),
    containerId,
    recipeId,
    quantity: 1,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const createMenuRow = (
  userId: string,
  recipeId: string,
  overrides: Partial<MenuRow> = {},
): MenuRow => {
  const row: MenuRow = {
    id: randomUUID(),
    quantity: 1,
    day: null,
    userId,
    recipeId,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const createItemRow = (
  userId: string,
  ingredientId: string,
  overrides: Partial<ItemRow> = {},
): ItemRow => {
  const row: ItemRow = {
    id: randomUUID(),
    quantity: 1,
    unit: "st",
    checked: false,
    userId,
    ingredientId,
    menuId: null,
    recipeIngredientId: null,
  };

  return {
    ...row,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ),
  };
};

export const resetRecipeTables = async () => {
  /* eslint-disable drizzle/enforce-delete-with-where */
  await db.delete(items);
  await db.delete(menu);
  await db.delete(recipe_recipe);
  await db.delete(recipe_ingredient);
  await db.delete(recipe_group);
  await db.delete(recipe);
  await db.delete(ingredient);
  await db.delete(subcategory);
  await db.delete(category);
  await db.delete(users);
  /* eslint-enable drizzle/enforce-delete-with-where */
};

export const seedBaseFixtures = async (): Promise<BaseFixtures> => {
  const categoryId = Math.floor(Math.random() * 1_000_000_000);
  const subcategoryId = categoryId + 1;
  const user = createUser({
    name: "Owner",
    email: `owner-${randomUUID()}@example.com`,
  });
  const otherUser = createUser({
    name: "Other User",
    email: `other-${randomUUID()}@example.com`,
  });
  const categoryRow: CategoryRow = { id: categoryId, name: "Pantry" };
  const subcategoryRow: SubcategoryRow = {
    id: subcategoryId,
    name: "Baking",
    categoryId: categoryRow.id,
  };
  const ingredientRows: BaseFixtures["ingredients"] = {
    flour: {
      id: randomUUID(),
      name: "Flour",
      categoryId,
      subcategoryId,
    },
    milk: { id: randomUUID(), name: "Milk", categoryId, subcategoryId },
    salt: { id: randomUUID(), name: "Salt", categoryId, subcategoryId },
    pepper: {
      id: randomUUID(),
      name: "Pepper",
      categoryId,
      subcategoryId,
    },
    butter: {
      id: randomUUID(),
      name: "Butter",
      categoryId,
      subcategoryId,
    },
    egg: { id: randomUUID(), name: "Egg", categoryId, subcategoryId },
    tomato: {
      id: randomUUID(),
      name: "Tomato",
      categoryId,
      subcategoryId,
    },
    cheese: {
      id: randomUUID(),
      name: "Cheese",
      categoryId,
      subcategoryId,
    },
  };

  await db.insert(users).values([user, otherUser]);
  await db.insert(category).values(categoryRow);
  await db.insert(subcategory).values(subcategoryRow);
  await db.insert(ingredient).values(Object.values(ingredientRows));

  return {
    user,
    otherUser,
    category: categoryRow,
    subcategory: subcategoryRow,
    ingredients: ingredientRows,
  };
};

export const insertRecipeGraph = async ({
  userId,
  recipe: recipeOverrides,
  groups,
  contained = [],
}: {
  userId: string;
  recipe?: Partial<RecipeRow>;
  groups: GroupInput[];
  contained?: Array<{
    id?: string;
    quantity: number;
    recipeId: string;
  }>;
}): Promise<RecipeGraph> => {
  const recipeRow = createRecipeRow(userId, recipeOverrides);
  await db.insert(recipe).values(recipeRow);

  const groupRows = groups.map((group) =>
    createGroupRow(recipeRow.id, {
      id: group.id,
      name: group.name,
      order: group.order,
    }),
  );

  if (groupRows.length) {
    await db.insert(recipe_group).values(groupRows);
  }

  const ingredientRows = groups.flatMap((group, groupIndex) =>
    group.ingredients.map((ingredientInput) =>
      createRecipeIngredientRow(
        groupRows[groupIndex]!.id,
        ingredientInput.ingredientId,
        {
          id: ingredientInput.id,
          quantity: ingredientInput.quantity,
          unit: ingredientInput.unit,
          order: ingredientInput.order,
        },
      ),
    ),
  );

  if (ingredientRows.length) {
    await db.insert(recipe_ingredient).values(ingredientRows);
  }

  const containedRows = contained.map((row) =>
    createContainedRecipeRow(recipeRow.id, row.recipeId, {
      id: row.id,
      quantity: row.quantity,
    }),
  );

  if (containedRows.length) {
    await db.insert(recipe_recipe).values(containedRows);
  }

  return {
    recipe: recipeRow,
    groups: groupRows,
    ingredients: ingredientRows,
    contained: containedRows,
  };
};

export const insertMenuWithItems = async ({
  userId,
  recipeId,
  quantity = 1,
  itemRows,
}: {
  userId: string;
  recipeId: string;
  quantity?: number;
  itemRows: Array<{
    ingredientId: string;
    recipeIngredientId: string | null;
    quantity: number;
    unit: Unit;
  }>;
}) => {
  const menuRow = createMenuRow(userId, recipeId, { quantity });
  await db.insert(menu).values(menuRow);
  if (itemRows.length) {
    await db.insert(items).values(
      itemRows.map((itemRow) =>
        createItemRow(userId, itemRow.ingredientId, {
          menuId: menuRow.id,
          recipeIngredientId: itemRow.recipeIngredientId,
          quantity: itemRow.quantity,
          unit: itemRow.unit,
        }),
      ),
    );
  }
  return menuRow;
};

export const getRecipeItems = async (menuId: string) =>
  await db.query.items.findMany({
    where: eq(items.menuId, menuId),
    columns: {
      id: true,
      quantity: true,
      unit: true,
      ingredientId: true,
      recipeIngredientId: true,
    },
    orderBy: (item, { asc }) => [asc(item.recipeIngredientId), asc(item.id)],
  });
