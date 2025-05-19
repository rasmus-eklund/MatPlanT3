import SearchRecipeForm from "./_components/SearchRecipe";
import FoundRecipes from "./_components/FoundRecipes";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

type Props = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    shared?: "true" | "false";
  }>;
};

const page = async (props: WithAuthProps & Props) => {
  const searchParams = await props.searchParams;
  const params = {
    page: searchParams?.page ? Number(searchParams.page) : 1,
    search: searchParams?.search ?? "",
    shared: searchParams?.shared === "true",
  };
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm params={params} />
      <FoundRecipes params={params} user={props.user} />
    </div>
  );
};

export default WithAuth(page, false);
