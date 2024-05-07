import { randomUUID } from "crypto";
import RecipeForm from "../../_components/RecipeForm";
import { createRecipe } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import type { RecipeFormSubmit } from "~/types";
import { extractGroups } from "~/lib/utils";

const page = () => {
  const recipeId = randomUUID();
  const recipe: Recipe = {
    yours: true,
    id: recipeId,
    ingredients: [],
    contained: [],
    instruction: "Instruktion",
    isPublic: false,
    name: "Nytt recept",
    quantity: 2,
    unit: "port",
    createdAt: new Date(),
    updatedAt: new Date(),
    groups: [],
  };
  const handleSubmit = async (data: RecipeFormSubmit) => {
    "use server";
    const { groups, ingredients } = extractGroups({
      groups: data.groups,
      recipeId: data.id,
    });
    await createRecipe({ ...data, groups, ingredients });
  };
  return <RecipeForm recipe={recipe} onSubmit={handleSubmit} />;
};

export default page;
