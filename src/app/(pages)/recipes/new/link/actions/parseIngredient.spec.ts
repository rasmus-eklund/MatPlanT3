import { expect, test, describe } from "bun:test";
import {
  generateRegex,
  normalizeFractions,
  parseIngredient,
} from "./parseIngredient";
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
    input: "2,5 kg potatis",
    expected: { quantity: 2.5, unit: "kg", name: "potatis" },
  },
  {
    input: "1 paket jäst",
    expected: { quantity: 1, unit: "pkt", name: "jäst" },
  },
  {
    input: "50 cl vatten",
    expected: { quantity: 50, unit: "cl", name: "vatten" },
  },
];

describe("parseIngredient", () => {
  test("parses ingredients correctly", () => {
    for (const { input, expected } of testCases) {
      const pattern = generateRegex();
      const result = parseIngredient(input, pattern);
      expect(result).toEqual(expected);
    }
  });
  test("should not match 2 lime as liter", () => {
    const pattern = generateRegex();
    const result = parseIngredient("2 lime, saft och skal", pattern);
    expect(result).toEqual({ name: "lime", quantity: 2, unit: "st" });
  });
  test("should average a range of quantities", () => {
    const pattern = generateRegex();
    const result = parseIngredient("2-4 lime, saft och skal", pattern);
    expect(result).toEqual({ name: "lime", quantity: 3, unit: "st" });
  });
  test("should handle multiple spaces", () => {
    const pattern = generateRegex();
    const result = parseIngredient("2  -   4  msk   kakao", pattern);
    expect(result).toEqual({ name: "kakao", quantity: 3, unit: "msk" });
  });
  test("should average a range of quantities with fractions", () => {
    const pattern = generateRegex();
    const result = parseIngredient(
      "2 1/2 - 4 1/2 lime, saft och skal",
      pattern,
    );
    expect(result).toEqual({ name: "lime", quantity: 3.5, unit: "st" });
  });
  test("should average range with prefix", () => {
    const pattern = generateRegex();
    const result = parseIngredient(
      "600 - ca 700 g kycklingfilé eller kycklinginnerfilé",
      pattern,
    );
    expect(result).toEqual({
      name: "kycklingfile kycklinginnerfile",
      quantity: 650,
      unit: "g",
    });
  });
  test("should normalize ingredient names", () => {
    const pattern = generateRegex();
    const result = parseIngredient("1½ dl Arla Ko® Standardmjölk", pattern);
    expect(result).toEqual({
      name: "Arla Ko mjölk",
      quantity: 1.5,
      unit: "dl",
    });
  });
});

describe("Normalize fractions", () => {
  test("should normalize fractions", () => {
    const result = normalizeFractions("1½");
    expect(result).toEqual("1 1/2");
  });
  test("should normalize fractions", () => {
    const result = normalizeFractions("½");
    expect(result).toEqual("1/2");
  });
});
