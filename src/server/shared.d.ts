import type { getAllIngredients, getAllCategories } from "./api/admin";
import type { getServerAuthSession } from "./auth";

export type GetAllIngredients = Awaited<ReturnType<typeof getAllIngredients>>;

export type GetAllCategories = Awaited<ReturnType<typeof getAllCategories>>;

export type UserSession = Awaited<ReturnType<typeof getServerAuthSession>>;
