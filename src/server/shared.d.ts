import type { getAllIngredients, getAllCategories } from "./api/admin";

export type GetAllIngredients = Awaited<ReturnType<typeof getAllIngredients>>;

export type GetAllCategories = Awaited<ReturnType<typeof getAllCategories>>;
