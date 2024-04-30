import RecipeForm from "../../_components/RecipeForm";
import { createRecipe } from "~/server/api/recipes";
import { type Recipe } from "~/server/shared";

const page = () => {
  const recipe: Recipe = {
    yours: true,
    id: "placeholder",
    ingredients: [],
    contained: [],
    instruction: "Instruktion",
    isPublic: false,
    name: "Nytt recept",
    quantity: 2,
    unit: "port",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return <RecipeForm recipe={recipe} onSubmit={createRecipe} />;
};

export default page;
