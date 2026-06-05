import type { Unit } from "~/types";

type RecipeBackedItemUpdate = {
  id: string;
  quantity: number;
  unit: Unit;
  ingredientId: string;
};

type ExpectedRecipeBackedItem = Omit<RecipeBackedItemUpdate, "id"> & {
  recipeIngredientId: string;
};

export const groupItemsByRecipeIngredient = <
  T extends { recipeIngredientId: string },
>(
  rows: T[],
) => {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const list = grouped.get(row.recipeIngredientId) ?? [];
    list.push(row);
    grouped.set(row.recipeIngredientId, list);
  }
  return grouped;
};

export const getRecipeBackedItemChanges = ({
  expectedItems,
  existingItems,
}: {
  expectedItems: ExpectedRecipeBackedItem[];
  existingItems: (RecipeBackedItemUpdate & { recipeIngredientId: string })[];
}) => {
  const updates: RecipeBackedItemUpdate[] = [];
  const inserts: ExpectedRecipeBackedItem[] = [];
  const deleteIds: string[] = [];
  const expectedByRecipeIngredient =
    groupItemsByRecipeIngredient(expectedItems);
  const existingByRecipeIngredient =
    groupItemsByRecipeIngredient(existingItems);

  const allRecipeIngredientIds = new Set([
    ...expectedByRecipeIngredient.keys(),
    ...existingByRecipeIngredient.keys(),
  ]);

  for (const recipeIngredientId of allRecipeIngredientIds) {
    const expected = expectedByRecipeIngredient.get(recipeIngredientId) ?? [];
    const existing = existingByRecipeIngredient.get(recipeIngredientId) ?? [];
    const sharedCount = Math.min(expected.length, existing.length);

    for (let index = 0; index < sharedCount; index++) {
      const expectedItem = expected[index]!;
      const existingItem = existing[index]!;
      if (
        existingItem.quantity !== expectedItem.quantity ||
        existingItem.unit !== expectedItem.unit ||
        existingItem.ingredientId !== expectedItem.ingredientId
      ) {
        updates.push({
          id: existingItem.id,
          quantity: expectedItem.quantity,
          unit: expectedItem.unit,
          ingredientId: expectedItem.ingredientId,
        });
      }
    }

    inserts.push(...expected.slice(sharedCount));
    deleteIds.push(...existing.slice(sharedCount).map((item) => item.id));
  }

  return { updates, inserts, deleteIds };
};
