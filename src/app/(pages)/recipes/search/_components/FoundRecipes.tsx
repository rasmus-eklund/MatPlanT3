import Link from "next/link";
import AddToMenu from "./addToMenu";
import { api } from "~/trpc/server";
import PaginationNav from "./PaginationNav";
import Icon from "~/icons/Icon";

type Props = {
  parsed: {
    search: string;
    page: number;
    shared: "true" | "false";
  };
};

const FoundRecipes = async ({ parsed }: Props) => {
  const recipes = await api.recipe.search.query(parsed);
  return (
    <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
      <h2 className="text-xl text-c5">Recept:</h2>
      <ul className="flex flex-col gap-2">
        {!recipes.length && parsed.search && (
          <p className="text-c4">Hittade inga recept...</p>
        )}
        {!!recipes.length &&
          recipes.map(({ id, name, portions }) => (
            <li className="flex flex-col rounded-md bg-c2 p-1 text-c5" key={id}>
              <Link
                href={`/recipes/search/${id}`}
                className="w-fit font-semibold text-c5"
              >
                {name}
              </Link>
              <div className="flex w-full justify-between">
                <p className="text-c4">Port: {portions}</p>
                {parsed.shared === "false" && <AddToMenu id={id} />}
              </div>
            </li>
          ))}
      </ul>
      <PaginationNav results={recipes.length} data={parsed} />
    </section>
  );
};

export default FoundRecipes;
