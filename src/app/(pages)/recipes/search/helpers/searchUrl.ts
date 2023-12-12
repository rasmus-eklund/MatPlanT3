import { SearchRecipeSchema, tSearchRecipeSchema } from "~/zod/zodSchemas";

export const formatUrl = ({ search, shared, page }: tSearchRecipeSchema) => {
  return `/recipes/search?search=${search}&page=${page}&shared=${shared}`;
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const parseSearch = ({ searchParams }: Props): tSearchRecipeSchema => {
  const parsed = SearchRecipeSchema.safeParse(searchParams);
  if (!parsed.success) {
    return { search: "", page: 1, shared: "false" };
  }
  return parsed.data;
};
