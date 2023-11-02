"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "~/app/_components/buttons/Button";
import ShowRecipe from "~/app/_components/recipes/ShowRecipe";

import { api } from "~/trpc/react";

const Recipe = ({ params: { id } }: { params: { id: string } }) => {
  const router = useRouter();
  const {
    data: recipe,
    isLoading,
    isError,
    isSuccess,
  } = api.recipe.getById.useQuery(id);
  const { mutate: remove, isLoading: removingRecipe } =
    api.recipe.remove.useMutation({
      onSuccess: () => {
        router.push("/recipes/search");
      },
      onError: () => {},
    });

  return (
    <div className="flex flex-col gap-5 rounded-md">
      {isSuccess && (
        <ShowRecipe recipe={recipe}>
          <Button onClick={() => console.log(recipe.id)}>Lägg till meny</Button>

          <div className="flex items-center gap-4 py-2">
            <Link href={`/recipes/edit/${id}`}>
              <Button>Ändra</Button>
            </Link>
            <Button
              className="disabled:animate-spin"
              disabled={removingRecipe}
              onClick={() => remove({ id: recipe.id })}
            >
              Ta bort
            </Button>
          </div>
        </ShowRecipe>
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error...</p>}
    </div>
  );
};

export default Recipe;
