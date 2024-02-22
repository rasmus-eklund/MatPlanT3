import Link from "next/link";
import capitalize from "~/app/helpers/capitalize";
import { unitsAbbr } from "~/constants/units";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["recipe"]["getById"];

type Props = {
  recipe: Recipe;
};

const ShowRecipe = ({ recipe: { recipe, ingredients, contained } }: Props) => {
  return (
    <section className="flex flex-col gap-2 bg-c3 p-2">
      <h1 className="rounded-md bg-c2 px-1 text-xl font-bold text-c5">
        {recipe.name}
      </h1>
      <p className="text-xs">{recipe.isPublic ? "Publikt" : "Privat"}</p>
      <div className="flex justify-between">
        <h2 className="text-lg text-c5">{unitsAbbr[recipe.unit]}:</h2>
        <p className="w-10 rounded-md bg-c2 text-center text-c5">
          {recipe.quantity}
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
                    <p className="text-c5">
                      {rec.quantity} {unitsAbbr[recipe.unit]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="flex flex-col p-2">
        <h2 className="text-lg text-c5">Instruktion</h2>
        <div className="rounded-md bg-c2 p-2 pl-5 text-c5">
          <ol className="flex list-decimal flex-col gap-1 whitespace-pre-wrap">
            {recipe.instruction.split("\n\n").map((i) => (
              <li key={crypto.randomUUID()}>{i}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ShowRecipe;
