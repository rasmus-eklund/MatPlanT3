import { describe, it, expect } from "vitest";
import validateIngredient from "./validateIngredient";
import { Unit } from "types";

const data = [
  { name: "banan", id: "1" },
  { name: "apelsin", id: "2" },
  { name: "citron", id: "3" },
  { name: "ströbröd", id: "4" },
];

describe("Validate ingredient", () => {
  it("should find 5 st banan", () => {
    const input = { name: "bananer", unit: "st", quantity: "5" };
    const expected = {
      name: "banan",
      unit: "st" as Unit,
      quantity: 5,
    };
    const result = validateIngredient({ data, ing: input });
    expect(result.success).toBe(true);
    const { name, quantity, unit } = result.ingredient;
    expect({ name, quantity, unit }).toEqual(expected);
  });
  it("should find 0.5 dl ströbröd", () => {
    const input = { name: "ströbröd", unit: "dl", quantity: "0.5" };
    const expected = {
      name: "ströbröd",
      unit: "dl" as Unit,
      quantity: 0.5,
    };
    const result = validateIngredient({ data, ing: input });
    const { name, quantity, unit } = result.ingredient;
    expect(result.success).toBe(true);
    expect({ name, quantity, unit }).toEqual(expected);
  });
});
