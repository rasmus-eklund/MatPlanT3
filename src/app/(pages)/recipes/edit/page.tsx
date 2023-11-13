"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";

const CreateRecipePage = () => {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: creatingRecipe } =
    api.recipe.create.useMutation({
      onSuccess: (id) => {
        router.push(`/recipes/search/${id}`);
        router.refresh();
      },
    });
  return (
    <>
      <RecipeForm
        recipe={{
          recipe: {
            id: "placeholder",
            name: "Nytt recept",
            portions: 2,
            instruction: "Instruktion",
          },
          contained: [],
          ingredients: [],
        }}
        onSubmit={createRecipe}
      >
        <Button disabled={creatingRecipe} form="recipe-form">
          Skapa recept
        </Button>
      </RecipeForm>
    </>
  );
};

export default CreateRecipePage;
