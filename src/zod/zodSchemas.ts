import { z } from "zod";
import units from "~/app/constants/units";

export const zId = z.object({ id: z.string().min(1) });
export type Tid = z.infer<typeof zId>;

export const zStoreName = z
  .string()
  .min(1, "Store name should be minimum 1 character.");
export type tStoreName = z.infer<typeof zStoreName>;

export const zStoreNameId = z.object({
  name: zStoreName,
  id: z.string().min(1),
});
export type tStoreNameId = z.infer<typeof zStoreNameId>;

export const zStoreOrder = z.array(
  z.object({
    categoryId: z.number().min(1),
    subcategoryId: z.number().min(1),
  }),
);
export type tStoreOrder = z.infer<typeof zStoreOrder>;

export const zRecipe = z.object({
  name: z.string().min(2),
  portions: z.coerce.number().positive(),
  instruction: z.string(),
});
export type tRecipe = z.infer<typeof zRecipe>;

export const zIngredient = z.object({
  id: z.string().min(1),
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.enum(units),
  name: z.string().min(1),
});
export type tIngredient = z.infer<typeof zIngredient>;

export const zSearchFilter = z.object({
  search: z.string(),
});
export type tSearchFilter = z.infer<typeof zSearchFilter>;

export const zFullRecipe = z.object({
  recipe: zRecipe,
  ingredients: z.array(zIngredient),
});
export type tFullRecipe = z.infer<typeof zFullRecipe>;

export const zIngredientCat = z.object({
  name: z.string().min(1),
  categoryId: z.number().positive(),
  subcategoryId: z.number().positive(),
});
export type tIngredientCat = z.infer<typeof zIngredientCat>;
