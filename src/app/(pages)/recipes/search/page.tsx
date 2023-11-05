import SearchRecipeForm from "~/app/_components/recipes/SearchRecipeForm";
import { zSearchFilter } from "~/zod/zodSchemas";
import { api } from "~/trpc/server";
import FoundRecipes from "~/app/_components/recipes/FoundRecipes";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const validateSearchParams = ({ searchParams }: Props) => {
  const validatedSearchFilter = zSearchFilter.safeParse(searchParams);
  if (!validatedSearchFilter.success) {
    return { search: "" };
  }
  return validatedSearchFilter.data;
};

const RecipePage = async ({ searchParams }: Props) => {
  const recipes = await api.recipe.search.query({
    search: validateSearchParams({ searchParams }).search,
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm />
      <FoundRecipes recipes={recipes} />
    </div>
  );
};

export default RecipePage;
