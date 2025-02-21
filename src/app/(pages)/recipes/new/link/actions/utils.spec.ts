import { expect, test, describe } from "bun:test";
import { parseIngredient } from "./utils";
import type { Unit } from "~/types";

type TestCase = {
  input: string;
  expected: {
    quantity: number;
    unit: Unit;
    name: string;
  };
};
const testCases: TestCase[] = [
  {
    input: "1 1/2 dl grädde",
    expected: { quantity: 1.5, unit: "dl", name: "grädde" },
  },
  {
    input: "2 msk socker",
    expected: { quantity: 2, unit: "msk", name: "socker" },
  },
  { input: "3 st ägg", expected: { quantity: 3, unit: "st", name: "ägg" } },
  { input: "200 g smör", expected: { quantity: 200, unit: "g", name: "smör" } },
  {
    input: "1/2 tsk salt",
    expected: { quantity: 0.5, unit: "tsk", name: "salt" },
  },
  {
    input: "5 dl vetemjöl",
    expected: { quantity: 5, unit: "dl", name: "vetemjöl" },
  },
  {
    input: "En nypa socker",
    expected: { quantity: 1, unit: "st", name: "En nypa socker" },
  },
  {
    input: "2.5 kg potatis",
    expected: { quantity: 2.5, unit: "kg", name: "potatis" },
  },
  {
    input: "1 paket jäst",
    expected: { quantity: 1, unit: "st", name: "paket jäst" },
  },
  {
    input: "50 cl vatten",
    expected: { quantity: 50, unit: "cl", name: "vatten" },
  },
];

describe("parseIngredient", () => {
  test("parses ingredients correctly", () => {
    for (const { input, expected } of testCases) {
      const result = parseIngredient(input);
      expect(result).toEqual(expected);
    }
  });
});
