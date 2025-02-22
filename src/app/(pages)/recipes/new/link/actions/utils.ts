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
  pattern: string,
): ParsedIngredient => {
  const cleaned = removeStopWords(input)
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/é|è|ê/g, "e")
    .trim();

  const regex = new RegExp(pattern, "i");
  const match = cleaned.match(regex);
  if (match?.groups) {
    const { unit, name } = match.groups;
    let { quantity } = match.groups;
    if (quantity) {
      if (quantity.includes("/")) {
        const parts = quantity.split(" ");
        const fraction = parts.pop()!;
        const [numerator, denominator] = fraction.split("/").map(Number) as [
          number,
          number,
        ];
        const fractionValue = numerator / denominator;
        quantity =
          parts.length > 0
            ? (parseInt(parts[0]!) + fractionValue).toString()
            : fractionValue.toString();
      }
    }

    return {
      quantity: quantity ? parseFloat(quantity.replace(",", ".")) : 1,
      unit: unit ? (unit as Unit) : "st",
      name: name?.trim() ?? input.trim(),
    };
  }

  return { name: input.trim(), quantity: 1, unit: "st" };
};

export const generateRegex = () => {
  const prefixes = ["ca", "ev", "gärna"];
  const unitPattern = units
    .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const prefixPattern = prefixes
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = `(?<prefix>${prefixPattern})?\\s*(?<quantity>(\\d+\\s\\d+/\\d+|\\d+/\\d+|\\d+(\\.\\d+)?))?\\s*(?<unit>${unitPattern})?\\s*(?<name>[a-zA-ZåäöÅÄÖ ]+)`;
  return pattern;
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
