import { expect, describe, it } from "vitest";
import {
  groupSubcategoryByCategory,
  sortByChecked,
  sortByName,
} from "./sortAndGroup";
import { RouterOutputs } from "~/trpc/shared";
type Items = RouterOutputs["store"]["getById"]["order"];

describe("groupSubcategoryByCategory", () => {
  it("should group subcategories by category correctly", () => {
    const items: Items = [
      {
        category: { id: "1", name: "Category 1" },
        subcategory: { id: "11", name: "Subcategory 1" },
      },
      {
        category: { id: "1", name: "Category 1" },
        subcategory: { id: "12", name: "Subcategory 2" },
      },
      {
        category: { id: "2", name: "Category 2" },
        subcategory: { id: "21", name: "Subcategory 1" },
      },
    ];

    const expectedOutput = [
      {
        id: "1",
        name: "Category 1",
        subcategories: [
          { id: "11", name: "Subcategory 1" },
          { id: "12", name: "Subcategory 2" },
        ],
      },
      {
        id: "2",
        name: "Category 2",
        subcategories: [{ id: "21", name: "Subcategory 1" }],
      },
    ];

    const result = groupSubcategoryByCategory(items);
    expect(result).toEqual(expectedOutput);
  });

  it("should handle empty input array", () => {
    const items: Items = [];
    const result = groupSubcategoryByCategory(items);
    expect(result).toEqual([]);
  });

  it("should handle single item in input array", () => {
    const items = [
      {
        category: { id: "1", name: "Category 1" },
        subcategory: { id: "11", name: "Subcategory 1" },
      },
    ];

    const expectedOutput = [
      {
        id: "1",
        name: "Category 1",
        subcategories: [{ id: "11", name: "Subcategory 1" }],
      },
    ];

    const result = groupSubcategoryByCategory(items);
    expect(result).toEqual(expectedOutput);
  });
});

describe("sortByname", () => {
  it("should correctly sort by name (false -> true)", () => {
    const items = [
      { checked: false },
      { checked: true },
      { checked: false },
      { checked: true },
    ];
    const expectedOutput = [
      { checked: false },
      { checked: false },
      { checked: true },
      { checked: true },
    ];
    const result = sortByChecked(items);
    expect(result).toEqual(expectedOutput);
  });
});

describe("sortByName", () => {
  it("should correctly sort by name (a - z)", () => {
    const items = [
      { name: "banan" },
      { name: "apelsin" },
      { name: "citron" },
      { name: "ananas" },
    ];
    const expectedOutput = [
      { name: "ananas" },
      { name: "apelsin" },
      { name: "banan" },
      { name: "citron" },
    ];
    const result = sortByName(items);
    expect(result).toEqual(expectedOutput);
  });
});
