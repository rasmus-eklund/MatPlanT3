import { Decimal } from "@prisma/client/runtime/library";
import formatQuantityUnit from "./formatQuantityUnit";
import { expect, describe, it } from "vitest";
import { Unit } from "types";

describe("Format quantity and unit", () => {
  it("should format an object", () => {
    const input = [{ unit: "st", quantity: new Decimal(1) }];
    const expectedOutput = [{ unit: "st" as Unit, quantity: 1 }];

    const output = formatQuantityUnit(input);

    expect(output).toEqual(expectedOutput);
  });
});
