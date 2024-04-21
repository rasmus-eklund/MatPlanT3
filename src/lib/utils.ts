import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const capitalize = (s: string) =>
  s
    .split("")
    .map((l, i) => (i === 0 ? l.toUpperCase() : l))
    .join("");
