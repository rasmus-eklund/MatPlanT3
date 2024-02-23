import { describe, it, expect } from "vitest";
import scaleIngredients from "./scaleIngredients";

describe("Scale ingredients", () => {
  it("should double ingredients", () => {
    const input = [
      { name: "banan", quantity: 2 },
      { name: "apelsin", quantity: 5 },
    ];

    const expectedOutput = [
      { name: "banan", quantity: 4 },
      { name: "apelsin", quantity: 10 },
    ];

    const result = scaleIngredients(input, 2);

    expect(result).toEqual(expectedOutput);
  });
  it("should half ingredients", () => {
    const input = [
      { name: "banan", quantity: 2 },
      { name: "apelsin", quantity: 5 },
    ];

    const expectedOutput = [
      { name: "banan", quantity: 1 },
      { name: "apelsin", quantity: 2.5 },
    ];

    const result = scaleIngredients(input, 0.5);

    expect(result).toEqual(expectedOutput);
  });
});
