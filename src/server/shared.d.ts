import type { getAllIngredients, getAllCategories } from "./api/admin";
import type { getAllItems } from "./api/items";
import type { getAllStores, getStoreById } from "./api/stores";
import type { getUserStats, getAllUsers } from "./api/users";
import type { getServerAuthSession } from "./auth";

export type AllIngredients = Awaited<ReturnType<typeof getAllIngredients>>;

export type AllCategories = Awaited<ReturnType<typeof getAllCategories>>;

export type UserStats = Awaited<ReturnType<typeof getUserStats>>;

export type UserSession = Awaited<ReturnType<typeof getServerAuthSession>>;

export type AllUsers = Awaited<ReturnType<typeof getAllUsers>>;

export type Store = Awaited<ReturnType<typeof getAllStores>>;

export type StoreWithItems = Awaited<ReturnType<typeof getStoreById>>;

export type Item = (Awaited<ReturnType<typeof getAllItems>>)[number];
