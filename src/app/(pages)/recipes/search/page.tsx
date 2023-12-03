import SearchRecipeForm from "~/app/(pages)/recipes/search/_components/SearchRecipeForm";
import { api } from "~/trpc/server";
import FoundRecipes from "~/app/(pages)/recipes/search/_components/FoundRecipes";
import PaginationNav from "./_components/PaginationNav";
import { parseSearch } from "./helpers/searchUrl";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const RecipePage = async ({ searchParams }: Props) => {
  const parsed = parseSearch({ searchParams });
  const recipes = await api.recipe.search.query(parsed);
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm query={parsed} />
      <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <h2 className="text-xl text-c5">Recept:</h2>
        <ul className="flex flex-col gap-2">
          {!recipes.length && parsed.search && (
            <p className="text-c4">Hittade inga recept...</p>
          )}
          {!!recipes.length &&
            recipes.map((recipe) => (
              <FoundRecipes
                key={recipe.id}
                recipe={recipe}
                shared={parsed.shared === "true"}
              />
            ))}
        </ul>
        <PaginationNav results={recipes.length} data={parsed} />
      </section>
    </div>
  );
};

export default RecipePage;
