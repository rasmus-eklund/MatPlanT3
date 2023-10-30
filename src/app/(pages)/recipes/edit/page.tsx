"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "~/app/_components/buttons/Button";
import RecipeForm from "~/app/_components/recipes/RecipeForm";
import { api } from "~/trpc/react";

const CreateRecipePage = () => {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: creatingRecipe } =
    api.recipe.create.useMutation({
      onSuccess: (id) => router.push(`/recipes/search/${id}`),
    });
  return (
    <div>
      <RecipeForm
        recipe={{
          name: "Nytt recept",
          portions: 2,
          instruction: "Instruktion",
          contained: [],
          ingredients: [],
          id: "placeholder",
        }}
        onSubmit={({ id, recipe }) => {
          createRecipe(recipe);
        }}
      >
        <Button disabled={creatingRecipe} form="recipe-form">
          Skapa recept
        </Button>
      </RecipeForm>
    </div>
  );
};

export default CreateRecipePage;
