import type { SearchRecipeParams } from "~/types";

export const formatUrl = ({ search, shared, page }: SearchRecipeParams) => {
  return `/recipes?search=${search}&page=${page}&shared=${shared ? "true" : "false"}`;
};
