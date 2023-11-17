"use client";
import { useState } from "react";
import LoadingSpinner from "~/app/_components/LoadingSpinner";
import capitalize from "~/app/helpers/capitalize";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["menu"]["getById"][number];

type Props = { params: { id: string } };

const MenuRecipes = ({ params: { id } }: Props) => {
  const {
    data: recipes,
    isSuccess,
    isLoading,
    isError,
  } = api.menu.getById.useQuery({ id });
  return (
    <div className="flex flex-col gap-5">
      {isSuccess &&
        recipes.map((recipe) => (
          <Recipe key={recipe.recipe.id} recipe={recipe} />
        ))}
      {isLoading && <LoadingSpinner />}
      {isError && <p>Något gick fel...</p>}
    </div>
  );
};

type RecipeProps = { recipe: Recipe };
const Recipe = ({ recipe: { recipe, ingredients } }: RecipeProps) => {
  return (
    <section className="flex flex-col gap-2 bg-c3 p-2">
      <h1 className="rounded-md bg-c2 px-1 text-xl font-bold text-c5">
        {recipe.name}
      </h1>
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
                  <p>{unit}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg text-c5">Instruktion</h2>
        <form className="whitespace-pre-wrap rounded-md bg-c2 p-2 text-c5">
          <ul className="flex flex-col gap-2">
            {recipe.instruction.split("#").map((i, index) => (
              <InstructionItem
                item={i}
                id={recipe.id}
                key={recipe.id + index}
              />
            ))}
          </ul>
        </form>
      </div>
    </section>
  );
};

const InstructionItem = ({ item, id }: { item: string; id: string }) => {
  const [done, setDone] = useState(false);
  if (!!item) {
    return (
      <li className="flex gap-1">
        <input
          className="self-start mt-1"
          type="checkbox"
          checked={done}
          onChange={() => setDone((p) => !p)}
          name="checkInstruction"
          id={`${item.length}_${id}_input`}
        />
        <p className={`${done && "line-through"}`}>{item.replace("#", "")}</p>
      </li>
    );
  }
};

export default MenuRecipes;
