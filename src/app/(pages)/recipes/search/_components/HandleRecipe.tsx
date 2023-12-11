"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import AddToMenu from "./addToMenu";

type Props = { id: string; yours: boolean };

const HandleRecipe = ({ id, yours }: Props) => {
  const router = useRouter();
  const { mutate: remove, isLoading: removingRecipe } =
    api.recipe.remove.useMutation({
      onSuccess: () => {
        router.push("/recipes/search");
        router.refresh();
      },
      onError: () => {
        toast.error("Kunde inte ta bort recept.");
      },
    });

  const { mutate: copy, isLoading: copying } = api.recipe.copy.useMutation({
    onSuccess: ({ id }) => {
      router.push(`/recipes/search/${id}`);
      toast.success("Recept kopierat!");
    },
  });
  if (yours) {
    return (
      <div className="flex h-10 items-center justify-between p-2">
        <AddToMenu id={id} />
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
    <div className="flex h-10 items-center justify-between p-2">
      <Button onClick={() => router.back()}>Tillbaka</Button>
      <Button disabled={copying} onClick={() => copy({ id })}>
        Spara kopia till dina recept
      </Button>
    </div>
  );
};

export default HandleRecipe;
