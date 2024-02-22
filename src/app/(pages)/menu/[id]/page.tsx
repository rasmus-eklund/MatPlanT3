"use client";
import Link from "next/link";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import capitalize from "~/app/helpers/capitalize";
import { unitsAbbr } from "~/constants/units";
import Icon from "~/icons/Icon";
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
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <ClipLoader size={100} />
        </div>
      )}
      {isError && <p>Något gick fel...</p>}
    </div>
  );
};

type RecipeProps = { recipe: Recipe };
const Recipe = ({ recipe: { recipe, ingredients } }: RecipeProps) => {
  return (
    <section className="flex flex-col gap-2 bg-c3 p-2">
      <div className="flex items-center justify-between rounded-md bg-c2 px-1">
        <h1 className="grow text-xl font-bold text-c5">{recipe.name}</h1>
        <Link href={`/recipes/edit/${recipe.id}`}>
          <Icon icon="edit" className="h-8 fill-c5" />
        </Link>
      </div>
      <div className="flex justify-between">
        <h2 className="text-lg text-c5">{unitsAbbr[recipe.unit]}:</h2>
        <p className="w-10 rounded-md bg-c2 text-center text-c5">
          {recipe.quantity}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg text-c5">Ingredienser</h2>
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {ingredients.map((ing) => (
            <Ingredient key={ing.id} {...ing} />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg text-c5">Instruktion</h2>
        <form className="rounded-md bg-c2 p-2 text-c5">
          <ul className="flex flex-col gap-1">
            {recipe.instruction.split("\n\n").map((i, index) => (
              <InstructionItem item={i} key={recipe.id + index} />
            ))}
          </ul>
        </form>
      </div>
    </section>
  );
};

const Ingredient = ({
  name,
  quantity,
  unit,
}: Recipe["ingredients"][number]) => {
  const [checked, setChecked] = useState(false);
  return (
    <li
      onClick={() => setChecked((p) => !p)}
      className={`flex cursor-pointer select-none justify-between rounded-md bg-c2 p-1 px-2 text-c4 md:hover:bg-c3 ${
        checked && "bg-c3"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-3 flex items-center justify-center rounded-[3px] border border-c4 ${
            checked ? "bg-c4" : "bg-c1"
          }`}
        ></div>
        <p>{capitalize(name)}</p>
      </div>
      <div className="flex gap-1">
        <p>{quantity}</p>
        <p>{unit}</p>
      </div>
    </li>
  );
};

const InstructionItem = ({ item }: { item: string }) => {
  const [done, setDone] = useState(false);
  if (!!item) {
    return (
      <li
        onClick={() => setDone((p) => !p)}
        className={`flex cursor-pointer gap-2 rounded-md p-1 md:hover:bg-c3 ${
          done && "bg-c3"
        }`}
      >
        <div
          className={`mt-1 flex size-3 shrink-0 items-center justify-center rounded-[3px] border border-c4 ${
            done ? "bg-c4" : "bg-c1"
          }`}
        ></div>
        <p
          className={`select-none whitespace-pre-wrap ${
            done && "line-through"
          }`}
        >
          {done
            ? item
                .split(/[\s,.;:!?()\b]+/)
                .filter((word) => word.trim() !== "")
                .slice(0, 2)
                .join(" ") + "..."
            : item}
        </p>
      </li>
    );
  }
};

export default MenuRecipes;
