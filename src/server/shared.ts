import type { getAllIngredients, getAllCategories } from "./api/admin";
import type { getAuditLogs } from "./api/auditLog";
import type { getAllItems } from "./api/items";
import { type getMenu } from "./api/menu";
import type { getRecipeById, searchRecipeName } from "./api/recipes";
import type { getAllStores, getStoreById } from "./api/stores";
import type { getUserStats, getAllUsers } from "./api/users";
import type { getServerAuthSession } from "./auth";

export type AllIngredients = Awaited<ReturnType<typeof getAllIngredients>>;

export type AllCategories = Awaited<ReturnType<typeof getAllCategories>>;

export type UserStats = Awaited<ReturnType<typeof getUserStats>>;

export type UserSession = Awaited<ReturnType<typeof getServerAuthSession>>;

export type AllUsers = Awaited<ReturnType<typeof getAllUsers>>;

export type Stores = Awaited<ReturnType<typeof getAllStores>>;

export type Store = Awaited<ReturnType<typeof getStoreById>>;

export type Item = Awaited<ReturnType<typeof getAllItems>>[number];

export type Recipe = Awaited<ReturnType<typeof getRecipeById>>;

export type MenuItem = Awaited<ReturnType<typeof getMenu>>[number];

export type RecipeSearch = Awaited<ReturnType<typeof searchRecipeName>>;

export type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>[number];
