import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";

type Recipes = RouterOutputs["recipe"]["search"];

type Props = {
  recipes: Recipes;
};
const FoundRecipes = ({ recipes }: Props) => {
  return (
    <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
      <h2 className="text-xl text-c5">Recept:</h2>
      <ul className="flex flex-col gap-2">
        {!recipes.length ? (
          <p className="text-c1">Hittade inga recept...</p>
        ) : (
          recipes.map((r) => (
            <li
              className="flex items-center justify-between rounded-md bg-c2
             px-2 py-1 font-bold text-c5"
              key={r.id}
            >
              <Link
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                href={`/recipes/search/${r.id}`}
              >
                {r.name}
              </Link>
              <div className="flex shrink-0 items-center gap-4">
                {/* <Button name="Lägg till" callback={() => addRecipe(r)} /> */}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default FoundRecipes;
