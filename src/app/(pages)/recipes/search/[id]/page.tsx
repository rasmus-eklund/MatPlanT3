"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import ShowRecipe from "~/app/(pages)/recipes/components/ShowRecipe";

import { api } from "~/trpc/react";

const Recipe = ({ params: { id } }: { params: { id: string } }) => {
  const utils = api.useUtils();
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
        utils.recipe.search.invalidate();
        router.push("/recipes/search");
      },
      onError: () => {},
    });
  const { mutate: addToMenu, isLoading: addingToMenu } =
    api.menu.addRecipe.useMutation({
      onSuccess: () => {
        toast.success("Recept tillagt!");
      },
    });

  return (
    <>
      {isSuccess && (
        <ShowRecipe recipe={recipe}>
          <Button
            callToAction
            onClick={() => addToMenu({ id })}
            disabled={addingToMenu}
          >
            Lägg till meny
          </Button>
          <div className="flex items-center gap-4 py-2">
            <Button onClick={() => router.push(`/recipes/edit/${id}`)}>
              Ändra
            </Button>
            <Button
              disabled={removingRecipe}
              onClick={() => remove({ id: recipe.recipe.id })}
            >
              Ta bort
            </Button>
          </div>
        </ShowRecipe>
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error...</p>}
    </>
  );
};

export default Recipe;
