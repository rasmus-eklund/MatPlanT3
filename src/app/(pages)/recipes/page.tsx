import { Suspense } from "react";
import SearchRecipeForm from "./_components/SearchRecipe";
import FoundRecipes from "./_components/FoundRecipes";
import FoundRecipesLoading from "./_components/FoundRecipesLoading";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getRecipePageLimit } from "~/lib/constants/pagination";
import { errorMessages } from "~/server/errors";
import type { SearchRecipeParams } from "~/types";
import { searchRecipeSchema } from "~/zod/zodSchemas";

type Props = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    limit?: string;
    shared?: "true" | "false";
  }>;
};

const parseSearchRecipeParams = (
  searchParams: Awaited<Props["searchParams"]>,
): SearchRecipeParams => {
  const parsed = searchRecipeSchema.safeParse({
    page: searchParams?.page ? Number(searchParams.page) : 1,
    limit: getRecipePageLimit(searchParams?.limit),
    search: searchParams?.search ?? "",
    shared: searchParams?.shared === "true",
  });
  if (!parsed.success) {
    throw new Error(errorMessages.INVALIDDATA);
  }
  return parsed.data;
};

const getSearchRecipeReturnTo = (
  searchParams: Awaited<Props["searchParams"]>,
): string => {
  const params = new URLSearchParams();

  if (searchParams?.search !== undefined) {
    params.set("search", searchParams.search);
  }
  if (searchParams?.page !== undefined) {
    params.set("page", searchParams.page);
  }
  if (searchParams?.shared !== undefined) {
    params.set("shared", searchParams.shared);
  }
  if (searchParams?.limit !== undefined) {
    params.set("limit", searchParams.limit);
  }

  const query = params.toString();
  return query ? `/recipes?${query}` : "/recipes";
};

const page = async (props: WithAuthProps & Props) => {
  const searchParams = await props.searchParams;
  const params = parseSearchRecipeParams(searchParams);
  const searchRecipeKey = `search-${params.search}-${params.shared}-${params.page}-${params.limit}`;
  const foundRecipesKey = `results-${params.search}-${params.shared}-${params.page}-${params.limit}`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <SearchRecipeForm key={searchRecipeKey} params={params} />
      <Suspense
        key={foundRecipesKey}
        fallback={<FoundRecipesLoading params={params} />}
      >
        <FoundRecipes params={params} user={props.user} />
      </Suspense>
    </div>
  );
};

export default WithAuth(page, false, async (props) => {
  return getSearchRecipeReturnTo(await props.searchParams);
});
