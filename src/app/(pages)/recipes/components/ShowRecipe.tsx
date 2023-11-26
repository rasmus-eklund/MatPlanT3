import Link from "next/link";
import { ReactNode } from "react";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["recipe"]["getById"];

type Props = {
  recipe: Recipe;
  children?: ReactNode;
};

const ShowRecipe = ({
  recipe: { recipe, ingredients, contained },
  children,
}: Props) => {
  return (
    <section className="flex flex-col gap-2 bg-c3 p-2">
      <h1 className="rounded-md bg-c2 px-1 text-xl font-bold text-c5">
        {recipe.name}
      </h1>
      <p className="text-xs">{recipe.isPublic ? "Publikt" : "Privat"}</p>
      <div className="flex justify-between">
        <h2 className="text-lg text-c5">Portioner:</h2>
        <p className="w-10 rounded-md bg-c2 text-center text-c5">
          {recipe.portions}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg text-c5">Ingredienser</h2>
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {ingredients.map(({ name, quantity, unit, id }) => (
            <li className="rounded-md bg-c2 p-1" key={id}>
              <div className="flex justify-between text-c4">
                <p>{capitalize(name)}</p>
                <div className="flex gap-1">
                  <p>{quantity}</p>
                  <p> {unit}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {contained.length !== 0 && (
          <>
            <h2 className="text-lg text-c5">Länkade recept</h2>
            <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
              {contained.map((rec) => (
                <li className="rounded-md bg-c2 p-1" key={rec.id}>
                  <div className="flex justify-between text-c4">
                    <Link
                      className="overflow-ellipsis whitespace-nowrap"
                      href={`/recipes/search/${rec.containedRecipeId}`}
                    >
                      {rec.name}
                    </Link>
                    <p className="text-c5">{rec.portions} Portioner</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg text-c5">Instruktion</h2>
        <p className="whitespace-pre-wrap rounded-md bg-c2 p-2 text-c5">
          {recipe.instruction}
        </p>
      </div>
      <div className="flex items-center justify-between">{children}</div>
    </section>
  );
};

export default ShowRecipe;
