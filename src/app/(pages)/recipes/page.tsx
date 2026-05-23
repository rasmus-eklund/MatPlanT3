import SearchRecipeForm from "./_components/SearchRecipe";
import FoundRecipes from "./_components/FoundRecipes";
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

const page = async (props: WithAuthProps & Props) => {
  const searchParams = await props.searchParams;
  const params = parseSearchRecipeParams(searchParams);
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm params={params} />
      <FoundRecipes params={params} user={props.user} />
    </div>
  );
};

export default WithAuth(page, false, async (props) => {
  const params = parseSearchRecipeParams(await props.searchParams);
  return `/recipes?search=${params.search}&page=${params.page}&shared=${params.shared}&limit=${params.limit}`;
});
