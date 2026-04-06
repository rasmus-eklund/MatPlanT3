import type { Dispatch, SetStateAction } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Item } from "~/server/shared";
import type { SearchRecipeParams } from "~/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatUrl = ({ search, shared, page }: SearchRecipeParams) => {
  return `/recipes?search=${search}&page=${page}&shared=${shared ? "true" : "false"}`;
};

export const slugify = (str: string) => {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
};

export const delay = async (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const crudFactory = <T extends { id: string }>(
  fn: Dispatch<SetStateAction<T[]>>,
) => {
  const add = (item: T) => {
    fn((p) => [...p, item]);
  };
  const remove = ({ id }: { id: string }) => {
    fn((p) => p.filter((i) => i.id !== id));
  };
  const update = (item: T) => {
    fn((p) => {
      const index = p.findIndex((i) => i.id === item.id);
      const newItems = [...p];
      if (index !== -1) {
        newItems[index] = item;
      }
      return newItems;
    });
  };
  return { add, remove, update };
};

export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(
    `This value was thrown as is, not through an Error: ${stringified}`,
  );
  return error;
};

export const dateToString = (date: Date) =>
  date.toLocaleDateString("sv-SE", {
    dateStyle: "short",
  });

export const sortItemsByHomeAndChecked = (items: Item[]) => {
  const sorted: { home: Item[]; notHome: Item[]; checked: Item[] } = {
    checked: [],
    home: [],
    notHome: [],
  };

  for (const item of items) {
    if (item.home) {
      sorted.home.push(item);
    } else if (item.checked) {
      sorted.checked.push(item);
    } else {
      sorted.notHome.push(item);
    }
  }
  return sorted;
};

export const findArrayDifferences = <Item extends { id: string }>(
  A: Item[],
  B: Item[],
) => {
  const edited: Item[] = [];
  const added: Item[] = [];
  const removed: string[] = [];
  const mapA = new Map(A.map((item) => [item.id, item]));

  for (const itemB of B) {
    if (mapA.has(itemB.id)) {
      const itemA = mapA.get(itemB.id)!;
      if (!isEqual(itemA, itemB)) {
        edited.push(itemB);
      }
      mapA.delete(itemB.id);
    } else {
      added.push(itemB);
    }
  }

  for (const itemA of mapA.values()) {
    removed.push(itemA.id);
  }

  return { edited, added, removed };
};

const isEqual = <T extends { id: string }>(a: T, b: T) => {
  for (const key of Object.keys(a)) {
    if (key !== "id" && a[key as keyof T] !== b[key as keyof T]) {
      return false;
    }
  }
  return true;
};

export const decimalToFraction = (decimal: number): string => {
  if (decimal === 0) return "0";
  const integerPart = Math.floor(decimal);
  const decimalPart = decimal - integerPart;
  const fractionLookup: Record<number, string> = {
    0.333: "1/3",
    0.5: "1/2",
    0.667: "2/3",
  };

  if (decimalPart === 0) return `${integerPart}`;
  const roundedDecimal = Number(decimalPart.toFixed(3));
  const fraction = fractionLookup[roundedDecimal];
  if (fraction) {
    return integerPart > 0 ? `${integerPart} ${fraction}` : fraction;
  }

  return decimal.toFixed(2);
};
