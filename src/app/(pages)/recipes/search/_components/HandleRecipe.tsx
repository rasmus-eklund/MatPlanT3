"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import { SearchRecipeSchema } from "~/zod/zodSchemas";

type Props = { id: string; yours: boolean };

const HandleRecipe = ({ id, yours }: Props) => {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: remove, isLoading: removingRecipe } =
    api.recipe.remove.useMutation({
      onSuccess: () => {
        const { search, shared } = getPreviousSearch();
        router.push(`/recipes/search?search=${search}&shared=${shared}`);
        router.refresh();
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
    onSuccess: ({ id }) => {
      router.push(`/recipes/search/${id}`);
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
    <div className="flex h-10 items-center justify-between p-2">
      <Button onClick={() => router.back()}>Tillbaka</Button>
      <Button disabled={copying} onClick={() => copy({ id })}>
        Spara kopia till dina recept
      </Button>
    </div>
  );
};

const getPreviousSearch = () => {
  const raw = localStorage.getItem("search");
  if (!raw) {
    return { search: "", shared: "false" };
  }
  const { search, shared } = JSON.parse(raw);
  const parsed = SearchRecipeSchema.safeParse({
    search,
    shared: shared.toString(),
  });
  if (!parsed.success) {
    console.log(parsed.error);
    return { search: "", shared: "false" };
  }
  return parsed.data;
};
export default HandleRecipe;
