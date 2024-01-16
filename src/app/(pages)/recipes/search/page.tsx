"use client";
import SearchRecipeForm from "~/app/(pages)/recipes/search/_components/SearchRecipeForm";
import { api } from "~/trpc/react";
import FoundRecipes from "~/app/(pages)/recipes/search/_components/FoundRecipes";
import PaginationNav from "./_components/PaginationNav";
import { parseSearch } from "./helpers/searchUrl";
import { ClipLoader } from "react-spinners";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const RecipePage = ({ searchParams }: Props) => {
  const parsed = parseSearch({ searchParams });
  const {
    data: recipes,
    isError,
    isSuccess,
    isLoading,
  } = api.recipe.search.useQuery(parsed);
  if (isError) {
    return (
      <p className="w-full rounded-md border border-c5 bg-c1 p-1 text-c5">
        Något gick fel...
      </p>
    );
  }
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <ClipLoader size={100} />
      </div>
    );
  }
  if (isSuccess) {
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
  }
};

export default RecipePage;
