import Link from "next/link";
import PaginationNav from "./PaginationNav";
import { searchRecipes } from "~/server/api/recipes";
import type { SearchRecipeParams } from "~/types";
import AddToMenu from "./AddToMenu";

type Props = {
  params: SearchRecipeParams;
};

const FoundRecipes = async ({ params }: Props) => {
  const recipes = await searchRecipes(params);
  return (
    <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
      <h2 className="text-xl text-c5">Recept:</h2>
      <ul className="flex flex-col gap-2">
        {!recipes.length && params.search && (
          <p className="text-c4">Hittade inga recept...</p>
        )}
        {!!recipes.length &&
          recipes.map(({ id, name }) => (
            <li className="flex flex-col rounded-md bg-c2 p-1 text-c5" key={id}>
              <Link
                href={`/recipes/${id}`}
                className="w-fit font-semibold text-c5"
              >
                {name}
              </Link>
              <div className="flex w-full justify-end">
                {!params.shared && <AddToMenu id={id} />}
              </div>
            </li>
          ))}
      </ul>
      <PaginationNav results={recipes.length} params={params} />
    </section>
  );
};

export default FoundRecipes;
