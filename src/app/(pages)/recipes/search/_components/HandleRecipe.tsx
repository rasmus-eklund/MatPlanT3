"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";

type Props = { id: string; yours: boolean };

const HandleRecipe = ({ id, yours }: Props) => {
  const utils = api.useUtils();
  const router = useRouter();
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
        utils.menu.getAll.invalidate();
        toast.success("Recept tillagt!");
      },
    });
  const { mutate: copy, isLoading: copying } = api.recipe.copy.useMutation({
    onSuccess: () => {
      utils.recipe.search.invalidate();
      toast.success("Recept kopierat!");
    },
  });
  if (yours) {
    return (
      <div className="flex h-10 items-center justify-between p-2">
        <Button
          callToAction
          onClick={() => addToMenu({ id })}
          disabled={addingToMenu}
        >
          Lägg till meny
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/recipes/edit/${id}`)}>
            Ändra
          </Button>
          <Button disabled={removingRecipe} onClick={() => remove({ id })}>
            Ta bort
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-10 items-center justify-end p-2">
      <Button disabled={copying} onClick={() => copy({ id })}>
        Spara kopia till dina recept
      </Button>
    </div>
  );
};

export default HandleRecipe;
