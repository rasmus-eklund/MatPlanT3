import { Decimal } from "@prisma/client/runtime/library";
import { Unit } from "types";

const formatQuantityUnit = <T extends { unit: string; quantity: Decimal }>(
  ings: T[],
) =>
  ings.map(({ quantity, unit, ...rest }) => {
    return {
      ...rest,
      quantity: Number(quantity),
      unit: unit as Unit,
    };
  });

export default formatQuantityUnit;
