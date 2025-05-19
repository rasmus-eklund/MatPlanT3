import { randomUUID } from "crypto";
import RecipeForm from "../../_components/RecipeForm";
import { createRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

const page = ({ user }: WithAuthProps) => {
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
        await createRecipe({ ...newRecipe, user });
      }}
      user={user}
    />
  );
};

export default WithAuth(page, false);
