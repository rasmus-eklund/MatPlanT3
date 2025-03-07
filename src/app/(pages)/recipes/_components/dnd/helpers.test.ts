import { expect, test, describe } from "bun:test";
import { updateItem } from "./helpers";
import type { IngredientGroup } from "~/types";

describe("updateItem", () => {
  test("should update an item", () => {
    const groups: IngredientGroup[] = [
      {
        id: "1",
        name: "recept",
        order: 0,
        ingredients: [
          {
            id: "ing1",
            name: "ingredient1",
            quantity: 1,
            unit: "st",
            group: { id: "1", name: "group1", order: 0, recipeId: "1" },
            groupId: "1",
            ingredientId: "ingredientId1",
            order: 0,
            recipeId: "1",
          },
          {
            id: "ing2",
            name: "ingredient2",
            quantity: 1,
            unit: "st",
            group: { id: "1", name: "group1", order: 0, recipeId: "1" },
            groupId: "1",
            ingredientId: "ingredientId2",
            order: 1,
            recipeId: "1",
          },
        ],
      },
    ];
    const expected: IngredientGroup[] = [
      {
        id: "1",
        name: "recept",
        order: 0,
        ingredients: [
          {
            id: "ing1",
            name: "ingredient2",
            quantity: 2,
            unit: "dl",
            group: { id: "1", name: "group1", order: 0, recipeId: "1" },
            groupId: "1",
            ingredientId: "ingredientId2",
            order: 0,
            recipeId: "1",
          },
          {
            id: "ing2",
            name: "ingredient2",
            quantity: 1,
            unit: "st",
            group: { id: "1", name: "group1", order: 0, recipeId: "1" },
            groupId: "1",
            ingredientId: "ingredientId2",
            order: 1,
            recipeId: "1",
          },
        ],
      },
    ];
    const updated = updateItem("1", groups, {
      name: "ingredient2",
      quantity: 2,
      unit: "dl",
      id: "ing1",
      ingredientId: "ingredientId2",
    });
    expect(updated).toEqual(expected);
  });
});
