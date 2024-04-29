import type { Dispatch, SetStateAction } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const capitalize = (s: string) =>
  s
    .split("")
    .map((l, i) => (i === 0 ? l.toUpperCase() : l))
    .join("");

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

const crudFactory = <T extends { id: string }>(
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

export default crudFactory;
