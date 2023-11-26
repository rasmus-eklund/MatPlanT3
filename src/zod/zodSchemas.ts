import { z } from "zod";
import units from "~/constants/units";

export const zId = z.object({ id: z.string().min(1) });
export type tId = z.infer<typeof zId>;

export const zNameId = z.object({
  name: z.string().min(1, "Name should be minimum 1 character."),
  id: z.string().min(1),
});

export const zIngredientName = z.object({ name: z.string().min(2) });
export type tIngredientName = z.infer<typeof zIngredientName>;

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

export const zContained = z.object({
  id: z.string().min(1),
  containedRecipeId: z.string().min(1),
  name: z.string().min(1),
  portions: z.number().positive(),
});
export type tContained = z.infer<typeof zContained>;

export const zSearchFilter = z.object({
  search: z.string(),
});
export type tSearchFilter = z.infer<typeof zSearchFilter>;

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

export const zPortions = z.object({ portions: z.coerce.number().positive() });
export type tPortions = z.infer<typeof zPortions>;

export const zPortionsId = z.object({
  portions: z.coerce.number().positive(),
  id: z.string().min(1),
});
export type zPortionsId = z.infer<typeof zPortionsId>;

export const zChecked = z.object({
  id: z.string().min(1),
  checked: z.boolean(),
});
export type zChecked = z.infer<typeof zChecked>;
