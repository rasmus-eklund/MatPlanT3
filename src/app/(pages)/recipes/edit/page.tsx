"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
type Recipe = RouterOutputs["recipe"]["getById"];

const CreateRecipePage = () => {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: creatingRecipe } =
    api.recipe.create.useMutation({
      onSuccess: (id) => {
        router.push(`/recipes/search/${id}`);
        router.refresh();
      },
    });
  const newRecipe: Recipe = {
    recipe: {
      id: "placeholder",
      name: "Nytt recept",
      portions: 2,
      instruction: "Instruktion",
      isPublic: false,
    },
    contained: [],
    ingredients: [],
    yours: true,
  };
  return (
    <RecipeForm
      loading={creatingRecipe}
      recipe={newRecipe}
      onSubmit={createRecipe}
    >
      <Button disabled={creatingRecipe} form="recipe-form">
        Skapa recept
      </Button>
    </RecipeForm>
  );
};

export default CreateRecipePage;
