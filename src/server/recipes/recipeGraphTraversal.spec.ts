import { describe, expect, test } from "bun:test";
import { errorMessages } from "~/server/errors";
import { createRecipeGraphTraversal } from "./recipeGraphTraversal";

type TestGraph = Record<string, string[]>;

const createTestTraversal = () =>
  createRecipeGraphTraversal<TestGraph>(
    async ({ context, direction, recipeId }) => {
      if (direction === "children") return context[recipeId] ?? [];

      return Object.entries(context)
        .filter(([, children]) => children.includes(recipeId))
        .map(([parentId]) => parentId);
    },
  );

describe("recipe graph traversal", () => {
  test("allows a shared child descendant through multiple branches", async () => {
    const graph = {
      "pizza-party": ["hawaii-pizza", "capricciosa-pizza"],
      "hawaii-pizza": ["pizza-dough"],
      "capricciosa-pizza": ["pizza-dough"],
      "pizza-dough": [],
    };

    const traversal = createTestTraversal();

    expect(
      (
        await traversal.getLinkedRecipeDescendants({
          context: graph,
          direction: "children",
          recipeId: "pizza-party",
        })
      ).toSorted(),
    ).toEqual(["capricciosa-pizza", "hawaii-pizza", "pizza-dough"].toSorted());
  });

  test("throws when the current branch loops back on itself", async () => {
    const graph = {
      pizza: ["pizza-dough"],
      "pizza-dough": ["pizza"],
    };

    const traversal = createTestTraversal();

    expect(
      traversal.getLinkedRecipeDescendants({
        context: graph,
        direction: "children",
        recipeId: "pizza",
      }),
    ).rejects.toThrow(errorMessages.CIRCULARREF);
  });

  test("walks parent links with shared ancestors", async () => {
    const graph = {
      "pizza-party": ["hawaii-pizza", "capricciosa-pizza"],
      "hawaii-pizza": ["pizza-dough"],
      "capricciosa-pizza": ["pizza-dough"],
      "pizza-dough": [],
    };

    const traversal = createTestTraversal();

    expect(
      (
        await traversal.getLinkedRecipeDescendants({
          context: graph,
          direction: "parents",
          recipeId: "pizza-dough",
        })
      ).toSorted(),
    ).toEqual(["capricciosa-pizza", "hawaii-pizza", "pizza-party"].toSorted());
  });

  test("checks whether a candidate recipe contains the edited recipe", async () => {
    const graph = {
      "hawaii-pizza": ["pizza-dough"],
      "pizza-dough": [],
    };

    const traversal = createTestTraversal();

    expect(
      await traversal.recipeContainsRecipe({
        context: graph,
        sourceId: "hawaii-pizza",
        targetId: "pizza-dough",
      }),
    ).toBe(true);
    expect(
      await traversal.recipeContainsRecipe({
        context: graph,
        sourceId: "pizza-dough",
        targetId: "hawaii-pizza",
      }),
    ).toBe(false);
  });
});
