import SearchRecipeForm from "./_components/SearchRecipe";
import FoundRecipes from "./_components/FoundRecipes";

type Props = {
  searchParams?: { search?: string; page?: string; shared?: "true" | "false" };
};

const page = ({ searchParams }: Props) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm />
      <FoundRecipes
        params={{
          page: searchParams?.page ? Number(searchParams.page) : 1,
          search: searchParams?.search ?? "",
          shared: searchParams?.shared === "true" ?? false,
        }}
      />
    </div>
  );
};

export default page;
