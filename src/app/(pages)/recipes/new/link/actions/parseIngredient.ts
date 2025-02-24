import type Fuse from "fuse.js";
import { stopWords } from "~/lib/constants/stopwords";
import units from "~/lib/constants/units";
import type { Unit } from "~/types";

type ParsedIngredient = {
  quantity: number;
  unit: Unit;
  name: string;
};

export const parseIngredient = (
  input: string,
  regex: RegExp,
): ParsedIngredient => {
  const cleaned = clean(input);

  const match = cleaned.match(regex);
  if (match?.groups) {
    const { unit } = match.groups;
    let { quantity } = match.groups;
    if (quantity) {
      if (quantity.includes("-")) {
        const [min, max] = quantity
          .split("-")
          .map((q) => parseFraction(q.trim())) as [number, number];
        quantity = ((min + max) / 2).toString();
      } else {
        quantity = parseFraction(quantity).toString();
      }
    }

    const name = normalizeIngredientName(
      [match.groups?.name, match.groups?.altName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    );

    return {
      quantity: quantity ? parseFloat(quantity.replace(",", ".")) : 1,
      unit: unit ? (unit as Unit) : "st",
      name: name ?? input.trim(),
    };
  }

  return { name: input.trim(), quantity: 1, unit: "st" };
};

export const generateRegex = () => {
  const unitPattern = `\\b(${units.join("|")})\\b`;
  const pattern = `(?<quantity>(\\d+\\s\\d+/\\d+|\\d+/\\d+|\\d+(\\.\\d+)?)(\\s?-\\s?(\\d+\\s\\d+/\\d+|\\d+/\\d+|\\d+(\\.\\d+)?))?)?\\s*(?<unit>${unitPattern})?\\s*(?<name>[a-zA-ZåäöÅÄÖ ]+)`;
  return new RegExp(pattern, "i");
};

const removeStopWords = (input: string) => {
  const words = input.split(" ");
  const filteredWords = words.filter((word) => !stopWords.has(word));
  return filteredWords.join(" ");
};

export const searchWithFuzzy = (
  ingredient: string,
  fuse: Fuse<{
    name: string;
    id: string;
    categoryId: number;
    subcategoryId: number;
  }>,
) => {
  const fullResult = fuse.search(ingredient)[0];

  if (fullResult && fullResult.score! < 0.1) {
    return fullResult;
  }

  const splitResult = ingredient
    .split(" ")
    .flatMap((part) => fuse.search(part))
    .toSorted((a, b) => a.score! - b.score!)[0];

  if (splitResult && fullResult && splitResult.score! < fullResult.score!) {
    return splitResult;
  }

  return splitResult ?? fullResult;
};

const parseFraction = (input: string): number => {
  const parts = input.split(" ");
  if (parts.length === 2 && parts[1]!.includes("/")) {
    const [whole, fraction] = parts as [string, string];
    const [numerator, denominator] = fraction.split("/").map(Number) as [
      number,
      number,
    ];
    return parseInt(whole) + numerator / denominator;
  } else if (input.includes("/")) {
    const [numerator, denominator] = input.split("/").map(Number) as [
      number,
      number,
    ];
    return numerator / denominator;
  }
  return parseFloat(input);
};

const wordReplacements: Record<string, string> = {
  vitlöksklyfta: "klyfta vitlök",
  standardmjölk: "mjölk",
  peppar: "svartpeppar",
  paket: "pkt",
};

export const normalizeIngredientName = (input: string): string => {
  let result = input;

  for (const [key, value] of Object.entries(wordReplacements)) {
    result = result.replace(new RegExp(`\\b${key}\\b`, "gi"), value);
  }

  return result;
};

export const normalizeFractions = (input: string): string => {
  const fractionMap: Record<string, string> = {
    "½": "1/2",
    "⅓": "1/3",
    "⅔": "2/3",
    "¼": "1/4",
    "¾": "3/4",
    "⅕": "1/5",
    "⅖": "2/5",
    "⅗": "3/5",
    "⅘": "4/5",
  };

  return input.replace(/(\d)([½⅓⅔¼¾⅕⅖⅗⅘])/g, (_, digit, fraction) => {
    return `${digit} ${fractionMap[fraction as string] ?? fraction}`;
  });
};

const clean = (input: string) =>
  normalizeIngredientName(
    normalizeFractions(
      removeStopWords(
        input
          .replace(/\s*\(.*?\)\s*/g, " ")
          .replace(/é|è|ê/g, "e")
          .replace(/®/g, "")
          .trim(),
      ),
    ),
  );
