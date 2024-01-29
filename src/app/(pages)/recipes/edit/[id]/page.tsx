"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";
import { ClipLoader } from "react-spinners";

type Props = { params: { id: string } };
const EditRecipePage = ({ params: { id } }: Props) => {
  const router = useRouter();
  const utils = api.useUtils();
  const {
    data: recipe,
    isLoading,
    isError,
    isSuccess,
  } = api.recipe.getById.useQuery(id);
  const { mutate: update, isLoading: updating } = api.recipe.update.useMutation(
    {
      onSuccess: () => {
        router.push(`/recipes/search/${id}`);
        router.refresh();
        utils.recipe.getById.invalidate();
      },
    },
  );
  if (isSuccess) {
    return (
      <RecipeForm loading={updating} recipe={recipe} onSubmit={update}>
        <Button disabled={updating} form="recipe-form">
          Spara ändring
        </Button>
      </RecipeForm>
    );
  }
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <ClipLoader size={100} />
      </div>
    );
  }
  if (isError) {
    return <p>Error...</p>;
  }
};

export default EditRecipePage;
