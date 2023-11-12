"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import Icon from "../icons/Icon";
import LoadingSpinner from "../LoadingSpinner";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  recipe: Recipe;
};

const FoundRecipes = ({ recipe }: Props) => {
  const { id, name, portions } = recipe;
  const utils = api.useUtils();
  const { mutate: add, isLoading: adding } = api.menu.addRecipe.useMutation({
    onSuccess: async () => {
      await utils.menu.getAll.invalidate();
      toast.success("Recept tillagt!");
    },
  });
  return (
    <li
      className="flex flex-col rounded-md bg-c2 px-2 py-1 font-bold text-c5"
      key={id}
    >
      <div className="flex items-center justify-between">
        <Link href={`/recipes/search/${id}`}>{name}</Link>
        <p>Portions: {portions}</p>
      </div>
      <button
        className="self-end"
        disabled={adding}
        onClick={() => add(recipe)}
      >
        {adding ? (
          <LoadingSpinner />
        ) : (
          <Icon icon="plus" className="w-10 fill-c3 md:hover:fill-c5" />
        )}
      </button>
    </li>
  );
};

export default FoundRecipes;
