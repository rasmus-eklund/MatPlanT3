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

export const zQuantity = z.object({ quantity: z.coerce.number().positive() });
export type tQuantity = z.infer<typeof zQuantity>;

export const zChecked = z.object({
  id: z.string().min(1),
  checked: z.boolean(),
});
export type zChecked = z.infer<typeof zChecked>;

export const zItemFilter = z.object({
  group: z.boolean(),
  hideRecipe: z.boolean(),
  selectedStore: z.string().min(1),
});

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
