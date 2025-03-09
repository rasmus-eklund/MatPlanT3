import { randomUUID } from "crypto";
import RecipeForm from "../../_components/RecipeForm";
import { createRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";

const page = () => {
  const recipeId = randomUUID() as string;
  const recipe: Recipe = {
    yours: true,
    id: recipeId,
    contained: [],
    instruction: "Instruktion",
    isPublic: false,
    name: "Nytt recept",
    quantity: 2,
    unit: "port",
    createdAt: new Date(),
    updatedAt: new Date(),
    groups: [
      { id: randomUUID(), name: "recept", order: 0, recipeId, ingredients: [] },
    ],
  };
  return <RecipeForm recipe={recipe} onSubmit={createRecipe} />;
};

export default page;
