import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import AddToMenu from "./addToMenu";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  recipe: Recipe;
  shared: boolean;
};

const FoundRecipes = ({ recipe, shared }: Props) => {
  const { id, name, portions } = recipe;
  return (
    <li className="flex flex-col rounded-md bg-c2 p-1 text-c5" key={id}>
      <Link
        href={`/recipes/search/${id}`}
        className="w-fit font-semibold text-c5"
      >
        {name}
      </Link>
      <div className="flex w-full justify-between">
        <p className="text-c4">Port: {portions}</p>{" "}
        {!shared && <AddToMenu id={id} />}
      </div>
    </li>
  );
};

export default FoundRecipes;
