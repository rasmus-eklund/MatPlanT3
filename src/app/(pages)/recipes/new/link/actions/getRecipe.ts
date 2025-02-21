"use server";

import { load } from "cheerio";
import { ldJsonSchema } from "~/zod/zodSchemas";
import { compact, type ContextDefinition } from "jsonld";
import { db } from "~/server/db";
import Fuse, { type IFuseOptions } from "fuse.js";
import { parseIngredient, searchWithFuzzy } from "./utils";
import type { CreateRecipeInput, ExternalRecipe } from "~/types";
import { randomUUID } from "node:crypto";

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
    return { ok: false, message: "Kunde inte läsa recept från länken" };
  }
  // eslint-disable-next-line
  const compacted = await compact(JSON.parse(ldJson), context);
  const parsed = ldJsonSchema.safeParse(compacted);
  if (!parsed.success) {
    return { ok: false, message: "Kunde inte läsa recept från länken" };
  }
  const {
    name,
    recipeIngredient,
    recipeInstructions,
    yield: recipeQuantity,
  } = parsed.data;
  const recipeId = randomUUID() as string;
  const ingNames = await getAllIngredients();

  const options: IFuseOptions<Ing> = {
    keys: ["name"],
    includeScore: true,
    threshold: 0.5,
  };
  const fuse = new Fuse(ingNames, options);
  const ingredients: ExternalRecipe["ingredients"] = [];
  const noMatch: CreateRecipeInput["ingredients"][number] = {
    id: randomUUID() as string,
    name: ingNames[0]!.name,
    ingredientId: ingNames[0]!.id,
    quantity: 1,
    unit: "st",
    order: 0,
    groupId: null,
    recipeId,
  };
  for (const ing of recipeIngredient) {
    const { quantity, unit, name } = parseIngredient(ing);
    if (!name) {
      ingredients.push({ input: ing, match: noMatch });
      continue;
    }
    const exactMatch = ingNames.find(
      (ing) => ing.name.toLowerCase() === name.toLowerCase(),
    );
    if (exactMatch) {
      ingredients.push({
        input: ing,
        match: {
          id: randomUUID(),
          name,
          ingredientId: exactMatch.id,
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
      ingredients.push({ input: ing, match: noMatch });
      continue;
    }

    const foundIng = ingNames[result.refIndex];
    if (foundIng) {
      const { id, name } = foundIng;
      ingredients.push({
        input: ing,
        match: {
          id: randomUUID(),
          name,
          ingredientId: id,
          quantity,
          unit,
          order: 0,
          groupId: null,
          recipeId,
        },
      });
    }
  }
  const instruction = recipeInstructions
    ? recipeInstructions
        .filter((i) => i.type === "HowToStep")
        .map((i) => i.text)
        .join("\n\n")
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
