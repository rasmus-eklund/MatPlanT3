import SearchRecipeForm from "~/app/_components/recipes/SearchRecipeForm";
import { zSearchFilter } from "~/zod/zodSchemas";
import { api } from "~/trpc/server";
import FoundRecipes from "~/app/_components/recipes/FoundRecipes";
import Link from "next/link";
import Button from "~/app/_components/buttons/Button";

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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SearchRecipeForm />
        <Link href={"/recipes/edit"}>
          <Button className="h-10">Nytt recept</Button>
        </Link>
      </div>
      <FoundRecipes recipes={recipes} />
    </div>
  );
};

export default RecipePage;
