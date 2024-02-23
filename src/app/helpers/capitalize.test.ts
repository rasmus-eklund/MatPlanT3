import { expect, it, describe } from "vitest";
import capitalize from "./capitalize";

describe("Capitalize string", () => {
  it("should capitalize a string", () => {
    const input = "abc";
    const expected = "Abc";
    const result = capitalize(input);
    expect(result).toBe(expected);
  });
  it("should capitalize a single letter", () => {
    const input = "a";
    const expected = "A";
    const result = capitalize(input);
    expect(result).toBe(expected);
  });
  it("should handle empty", () => {
    const input = "";
    const expected = "";
    const result = capitalize(input);
    expect(result).toBe(expected);
  });
});
