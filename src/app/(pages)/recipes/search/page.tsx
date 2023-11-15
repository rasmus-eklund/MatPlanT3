import SearchRecipeForm from "~/app/(pages)/recipes/components/SearchRecipeForm";
import { zSearchFilter } from "~/zod/zodSchemas";
import { api } from "~/trpc/server";
import FoundRecipes from "~/app/(pages)/recipes/components/FoundRecipes";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const RecipePage = async ({ searchParams }: Props) => {
  const search = validateSearchParams({ searchParams }).search;
  let recipes: Recipe[] = [];
  if (search) {
    recipes = await api.recipe.search.query({ search });
  }
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm />
      <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <h2 className="text-xl text-c5">Recept:</h2>
        <ul className="flex flex-col gap-2">
          {!recipes.length && search && (
            <p className="text-c4">Hittade inga recept...</p>
          )}
          {!search && <p className="text-c4">Sök för att hitta recept.</p>}
          {!!recipes.length &&
            recipes.map((recipe) => (
              <FoundRecipes key={recipe.id} recipe={recipe} />
            ))}
        </ul>
      </section>
    </div>
  );
};

const validateSearchParams = ({ searchParams }: Props) => {
  const parsed = zSearchFilter.safeParse(searchParams);
  if (!parsed.success) {
    return { search: "" };
  }
  return parsed.data;
};

export default RecipePage;
