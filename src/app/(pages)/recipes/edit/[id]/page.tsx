"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/buttons/Button";
import RecipeForm from "~/app/_components/recipes/RecipeForm";
import { api } from "~/trpc/react";

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
    { onSuccess: (id) => router.push(`/recipes/search/${id}`) },
  );
  return (
    <div>
      {isSuccess && (
        <RecipeForm
          recipe={recipe}
          onSubmit={(data) => {
            update(data);
          }}
        >
          <div className="flex justify-between">
            <Button onClick={() => router.back()}>Tillbaka</Button>
            <Button disabled={updating} form="recipe-form">
              Spara ändring
            </Button>
          </div>
        </RecipeForm>
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error...</p>}
    </div>
  );
};

export default EditRecipePage;
