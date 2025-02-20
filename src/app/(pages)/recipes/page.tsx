import SearchRecipeForm from "./_components/SearchRecipe";
import FoundRecipes from "./_components/FoundRecipes";

type Props = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    shared?: "true" | "false";
  }>;
};

const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = {
    page: searchParams?.page ? Number(searchParams.page) : 1,
    search: searchParams?.search ?? "",
    shared: searchParams?.shared === "true",
  };
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm params={params} />
      <FoundRecipes params={params} />
    </div>
  );
};

export default page;
