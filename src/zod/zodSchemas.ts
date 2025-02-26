import units from "~/lib/constants/units";
import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.enum(units),
  instruction: z.string(),
  isPublic: z.boolean(),
});
export type RecipeType = z.infer<typeof recipeSchema>;

export const searchRecipeSchema = z.object({
  search: z.string(),
  page: z.coerce.number().positive(),
  shared: z.boolean(),
});

export const zIngredientCat = z.object({
  name: z.string().min(1),
  categoryId: z.number(),
  subcategoryId: z.number(),
});
export type tIngredientCat = z.infer<typeof zIngredientCat>;

export const createAccountSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export type CreateAccount = z.infer<typeof createAccountSchema>;

export const itemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unit: z.enum(units),
  ingredientId: z.string().uuid(),
  name: z.string(),
});
export type Item = z.infer<typeof itemSchema>;

export const nameSchema = z.object({ name: z.string().min(2) });

export type NameType = z.infer<typeof nameSchema>;

const recipeYield = z.coerce.number().positive().optional();
const name = z.coerce.string();
const recipeIngredient = z.array(z.coerce.string());
export const ldJsonSchema = z.object({
  name,
  recipeIngredient,
  recipeInstructions: z
    .array(z.object({ type: z.string(), text: z.string() }))
    .optional(),
  recipeYield,
});

export const ldJsonSchemaFlatInstruction = z.object({
  name,
  recipeIngredient,
  recipeInstructions: z.array(z.string()).optional(),
  recipeYield,
});
export type FlatLdJsonSchema = z.infer<typeof ldJsonSchemaFlatInstruction>;

export const ldJsonSchemaNested = z.object({
  name,
  recipeIngredient,
  recipeInstructions: z.object({
    type: z.array(z.string()),
    itemListElement: z
      .array(
        z.object({
          type: z.array(z.string()),
          text: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
  recipeYield,
});
