"use server";

import { load } from "cheerio";
import {
  ldJsonSchema,
  ldJsonSchemaFlatInstruction,
  ldJsonSchemaNested,
  type FlatLdJsonSchema,
} from "~/zod/zodSchemas";
import { compact, type ContextDefinition } from "jsonld";
import { db } from "~/server/db";
import Fuse, { type IFuseOptions } from "fuse.js";
import {
  generateRegex,
  parseIngredient,
  searchWithFuzzy,
} from "./parseIngredient";
import type { ExternalRecipe } from "~/types";
import { randomUUID } from "crypto";

type Ing = Awaited<ReturnType<typeof getAllIngredients>>[number];
type ReturnProps = Promise<
  | {
      ok: true;
      recipe: ExternalRecipe;
    }
  | { ok: false; message: string }
>;
type Props = { url: string };

const context: ContextDefinition = {
  "@context": "http://schema.org/",
};

export const getRecipe = async ({ url }: Props): ReturnProps => {
  const res = await fetch(url, { mode: "no-cors" });
  const html = await res.text();
  const $ = load(html);
  const ldJson = $("script[type='application/ld+json']").first().html();
  if (!ldJson) {
    return {
      ok: false,
      message: "Receptet saknade metadata och kunde inte läsas",
    };
  }
  const parsed = await getNestedRecipe(ldJson);
  if (!parsed.ok) {
    return parsed;
  }
  const {
    name,
    recipeIngredient,
    recipeInstructions,
    yield: recipeQuantity,
  } = parsed.data;
  const recipeId = randomUUID();
  const ingNames = await getAllIngredients();

  const options: IFuseOptions<Ing> = {
    keys: ["name"],
    includeScore: true,
    threshold: 0.3,
  };
  const fuse = new Fuse(ingNames, options);
  const ingredients: ExternalRecipe["ingredients"] = [];

  const pattern = generateRegex();
  for (const input of recipeIngredient) {
    const id = randomUUID() as string;
    const { quantity, unit, name } = parseIngredient(input, pattern);
    const item = {
      id,
      input,
      match: {
        id,
        name: "",
        ingredientId: "",
        quantity,
        unit,
        order: 0,
        groupId: null,
        recipeId,
      },
    };
    if (!name) {
      ingredients.push(item);
      continue;
    }
    const exactMatch = ingNames.find(
      (ing) => ing.name.toLowerCase() === name.toLowerCase(),
    );
    if (exactMatch) {
      const { id: ingredientId, name } = exactMatch;
      ingredients.push({
        id,
        input,
        match: {
          id,
          name,
          ingredientId,
          quantity,
          unit,
          order: 0,
          groupId: null,
          recipeId,
        },
      });
      continue;
    }
    const result = searchWithFuzzy(name, fuse);
    if (!result) {
      ingredients.push(item);
      continue;
    }

    const foundIng = ingNames[result.refIndex];
    if (foundIng) {
      const { id: ingredientId, name } = foundIng;
      ingredients.push({
        id,
        input,
        match: {
          id,
          name,
          ingredientId,
          quantity,
          unit,
          order: 0,
          groupId: null,
          recipeId,
        },
      });
      continue;
    }
    ingredients.push(item);
  }
  const instruction = recipeInstructions
    ? recipeInstructions.join("\n\n")
    : "Instruktion";
  const quantity = recipeQuantity ?? 2;
  return {
    ok: true,
    recipe: {
      name,
      quantity,
      unit: "port",
      recipeId,
      ingredients,
      instruction,
    },
  };
};

const getAllIngredients = async () => await db.query.ingredient.findMany();

const getNestedRecipe = async (
  ldJson: string,
): Promise<
  { ok: true; data: FlatLdJsonSchema } | { ok: false; message: string }
> => {
  // eslint-disable-next-line
  const compacted = await compact(JSON.parse(ldJson), context);
  const parsed = ldJsonSchema.safeParse(compacted);
  if (parsed.success) {
    return {
      ok: true,
      data: {
        ...parsed.data,
        recipeInstructions:
          parsed.data.recipeInstructions
            ?.filter((i) => i.type === "HowToStep")
            .map((i) => i.text) ?? [],
      },
    };
  }

  const flatParsed = ldJsonSchemaFlatInstruction.safeParse(compacted);
  if (flatParsed.success) {
    return {
      ok: true,
      data: flatParsed.data,
    };
  }

  const arr = compacted["@graph"];
  if (!Array.isArray(arr)) {
    return { ok: false, message: "Kunde inte läsa recept från länken" };
  }

  const recipe = arr.find(
    (i) =>
      i.type === "Recipe" ||
      (Array.isArray(i.type) && (i.type as string[]).includes("Recipe")),
  );
  if (!recipe) {
    return { ok: false, message: "Kunde inte läsa recept från länken" };
  }

  const parseNested = ldJsonSchema.safeParse(recipe);
  if (parseNested.success) {
    return {
      ok: true,
      data: {
        ...parseNested.data,
        recipeInstructions:
          parseNested.data.recipeInstructions
            ?.filter((i) => i.type === "HowToStep")
            .map((i) => i.text) ?? [],
      },
    };
  }
  const parsedNested = ldJsonSchemaNested.safeParse(recipe);
  if (parsedNested.success) {
    const { recipeInstructions, ...rest } = parsedNested.data;
    const instructions = recipeInstructions.itemListElement
      ?.filter((i) => i.type.includes("HowToStep"))
      .map((i) => i.text);
    return {
      ok: true,
      data: {
        ...rest,
        recipeInstructions: instructions ?? [],
      },
    };
  }

  return { ok: false, message: "Kunde inte läsa recept från länken" };
};
