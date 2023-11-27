"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";

type Props = { params: { id: string } };
const EditRecipePage = ({ params: { id } }: Props) => {
  const router = useRouter();
  const {
    data: recipe,
    isLoading,
    isError,
    isSuccess,
  } = api.recipe.getById.useQuery(id);
  const { mutate: update, isLoading: updating } = api.recipe.update.useMutation(
    {
      onSuccess: () => {
        toast.success("Ändringar sparade!");
        router.push(`/recipes/search/${id}`);
        router.refresh();
      },
    },
  );
  return (
    <>
      {isSuccess && (
        <RecipeForm recipe={recipe} onSubmit={update}>
          <div className="flex justify-between">
            <Button disabled={updating} form="recipe-form">
              Spara ändring
            </Button>
          </div>
        </RecipeForm>
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error...</p>}
    </>
  );
};

export default EditRecipePage;
