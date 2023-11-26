"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import Icon from "~/icons/Icon";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  recipe: Recipe;
  shared: boolean;
};

const FoundRecipes = ({ recipe, shared }: Props) => {
  const { id, name, portions } = recipe;
  const utils = api.useUtils();
  const { mutate: add, isLoading: adding } = api.menu.addRecipe.useMutation({
    onSuccess: async () => {
      await utils.menu.getAll.invalidate();
      toast.success("Recept tillagt!");
    },
  });
  return (
    <li className="flex justify-between rounded-md bg-c2 p-1 text-c5" key={id}>
      <div className="flex flex-col">
        <Link
          prefetch={false}
          href={`/recipes/search/${id}`}
          className="font-semibold text-c5"
        >
          {name}
        </Link>
        <p className="text-c4">Port: {portions}</p>
      </div>
      <button disabled={adding} onClick={() => add(recipe)}>
        <Icon icon="home" className="w-10 fill-c3 md:hover:fill-c5" />
      </button>
    </li>
  );
};

export default FoundRecipes;
