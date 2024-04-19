import units from "~/lib/constants/units";
import { z } from "zod";

export const zId = z.object({ id: z.string().min(1) });
export type tId = z.infer<typeof zId>;

export const zNameId = z.object({
  name: z.string().min(1, "Name should be minimum 1 character."),
  id: z.string().min(1),
});

export const zName = z.object({ name: z.string().min(2) });
export type tName = z.infer<typeof zName>;

export const zStoreOrder = z.array(
  z.object({
    categoryId: z.coerce.number(),
    subcategoryId: z.coerce.number(),
  }),
);
export type tStoreOrder = z.infer<typeof zStoreOrder>;

export const zRecipe = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.enum(units),
  instruction: z.string(),
  isPublic: z.boolean(),
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

export const zContained = z.object({
  id: z.string().min(1),
  containedRecipeId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
});
export type tContained = z.infer<typeof zContained>;

export const SearchRecipeSchema = z.object({
  search: z.string(),
  page: z.coerce.number().positive(),
  shared: z.enum(["true", "false"]),
});
export type tSearchRecipeSchema = z.infer<typeof SearchRecipeSchema>;

export const SearchSchema = z.object({ search: z.string() });

export const zFullRecipe = z.object({
  recipe: zRecipe,
  ingredients: z.array(
    z.object({
      id: z.string().min(1),
      ingredientId: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unit: z.enum(units),
      name: z.string().min(1),
      order: z.number(),
    }),
  ),
  contained: z.array(zContained),
});
export type tFullRecipe = z.infer<typeof zFullRecipe>;

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
