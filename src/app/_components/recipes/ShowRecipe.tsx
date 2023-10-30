import Link from "next/link";
import { ReactNode } from "react";
import capitalize from "~/app/utils/capitalize";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["recipe"]["getById"];

type Props = {
  recipe: Recipe;
  children?: ReactNode;
};

const ShowRecipe = ({ recipe, children }: Props) => {
  return (
    <section className="flex flex-col gap-5 bg-c3 p-5">
      <h1 className="bg-c3 text-3xl font-bold text-c5">{recipe.name}</h1>
      <div className="flex flex-col gap-2 rounded-md bg-c4 p-2">
        <div className="flex justify-between">
          <h2 className="text-lg text-c2">Portioner:</h2>
          <p className="w-10 rounded-md bg-c3 text-center text-c5">
            {recipe.portions}
          </p>
        </div>
        <div className="flex flex-col gap-1 bg-c4">
          <h2 className="text-lg text-c2">Ingredienser</h2>
          <ul className="flex flex-col gap-1 rounded-md bg-c3 p-1">
            {recipe.ingredients.map(({ name, quantity, unit, id }) => (
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
          {recipe.contained.length !== 0 && (
            <>
              <h2 className="text-lg text-c2">Länkade recept</h2>
              <ul className="flex flex-col gap-1 rounded-md bg-c3 p-1">
                {recipe.contained.map((rec) => (
                  <li className="rounded-md bg-c2 p-1" key={rec.id}>
                    <div className="flex justify-between text-c4">
                      <Link className="text-lg" href={`/recipes/${rec.id}`}>
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
          <h2 className="text-lg text-c2">Instruktion</h2>
          <p className="whitespace-pre-wrap rounded-md bg-c3 p-2 text-c5">
            {recipe.instruction}
          </p>
        </div>
        <div className="flex items-center justify-between">{children}</div>
      </div>
    </section>
  );
};

export default ShowRecipe;
