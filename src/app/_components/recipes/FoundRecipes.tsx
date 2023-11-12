"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import Icon from "../icons/Icon";
import LoadingSpinner from "../LoadingSpinner";

type Recipe = RouterOutputs["recipe"]["search"][number];

type Props = {
  recipes: Recipe[];
};

const FoundRecipes = ({ recipes }: Props) => {
  const utils = api.useUtils();
  const { mutate: add, isLoading: adding } = api.menu.addRecipe.useMutation({
    onSuccess: async () => {
      await utils.menu.getAll.invalidate();
      toast.success("Recept tillagt!");
    },
  });
  return (
    <section className="flex flex-col gap-2 rounded-md bg-c3 p-2">
      <h2 className="text-xl text-c5">Recept:</h2>
      <ul className="flex flex-col gap-2">
        {!recipes.length ? (
          <p className="text-c1">Hittade inga recept...</p>
        ) : (
          recipes.map((r) => (
            <li
              className="flex flex-col rounded-md bg-c2 px-2 py-1 font-bold text-c5"
              key={r.id}
            >
              <Link href={`/recipes/search/${r.id}`}>{r.name}</Link>

              <button
                className="self-end"
                disabled={adding}
                onClick={() => add(r)}
              >
                {adding ? (
                  <LoadingSpinner />
                ) : (
                  <Icon icon="plus" className="w-10 fill-c3 md:hover:fill-c5" />
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default FoundRecipes;
