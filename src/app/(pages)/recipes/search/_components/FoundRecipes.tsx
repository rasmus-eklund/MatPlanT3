"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";

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
    <li className="flex flex-col rounded-md bg-c2 p-1 text-c5" key={id}>
      <Link
        href={`/recipes/search/${id}`}
        className="w-fit font-semibold text-c5"
      >
        {name}
      </Link>
      <div className="flex w-full justify-between">
        <p className="text-c4">Port: {portions}</p>{" "}
        {!shared && (
          <Button callToAction disabled={adding} onClick={() => add(recipe)}>
            Lägg till meny
          </Button>
        )}
      </div>
    </li>
  );
};

export default FoundRecipes;
