import { randomUUID } from "crypto";
import RecipeForm from "../../_components/RecipeForm";
import { createRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import { WithAuth } from "~/components/common/withAuth";

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
  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={async (newRecipe) => {
        "use server";
        await createRecipe(newRecipe);
      }}
    />
  );
};

export default WithAuth(page, false, async () => "/recipes/new/empty");
