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

export const ldJsonSchema = z.object({
  name: z.coerce.string(),
  recipeIngredient: z.array(z.coerce.string()),
  recipeInstructions: z
    .array(z.object({ type: z.string(), text: z.string() }))
    .optional(),
  yield: z.coerce.number().optional(),
});
export type LdJsonSchema = z.infer<typeof ldJsonSchema>;
