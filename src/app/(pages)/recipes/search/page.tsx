import SearchRecipeForm from "~/app/(pages)/recipes/components/SearchRecipeForm";
import { tSearchRecipeSchema, SearchRecipeSchema } from "~/zod/zodSchemas";
import { api } from "~/trpc/server";
import FoundRecipes from "~/app/(pages)/recipes/components/FoundRecipes";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const RecipePage = async ({ searchParams }: Props) => {
  const { search, shared } = validateSearchParams({ searchParams });
  let recipes: Recipe[] = [];
  if (search) {
    recipes = await api.recipe.search.query({ search, shared });
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
              <FoundRecipes
                key={recipe.id}
                recipe={recipe}
                shared={shared === "true"}
              />
            ))}
        </ul>
      </section>
    </div>
  );
};

const validateSearchParams = ({ searchParams }: Props): tSearchRecipeSchema => {
  const parsed = SearchRecipeSchema.safeParse(searchParams);
  if (!parsed.success) {
    return { search: "", shared: "false" };
  }
  return parsed.data;
};

export default RecipePage;
