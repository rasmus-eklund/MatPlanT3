"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "~/app/_components/Button";
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
        router.refresh();
      },
      onError: () => {},
    });

  return (
    <div className="flex flex-col gap-5 rounded-md">
      {isSuccess && (
        <ShowRecipe recipe={recipe}>
          <Button onClick={() => console.log(recipe)}>Lägg till meny</Button>
          <div className="flex items-center gap-4 py-2">
            <Link href={`/recipes/edit/${id}`}>
              <Button>Ändra</Button>
            </Link>
            <Button
              className="disabled: bg-c5"
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
    </div>
  );
};

export default Recipe;
