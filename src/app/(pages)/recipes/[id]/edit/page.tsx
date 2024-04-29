import { getRecipeById, updateRecipe } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";
import { findArrayDifferences } from "./utils";

type Props = { params: { id: string } };
const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={async ({ contained, ingredients, ...rest }) => {
        "use server";
        const {
          added: addIngredients,
          edited: editIngredients,
          removed: removeIngredients,
        } = findArrayDifferences(recipe.ingredients, ingredients);
        const { added, edited, removed } = findArrayDifferences(
          recipe.contained,
          contained,
        );
        await updateRecipe({
          recipe: rest,
          editIngredients,
          addIngredients,
          removeIngredients: removeIngredients.map((i) => i.id),
          addContained: added,
          editContained: edited,
          removeContained: removed.map((i) => i.id),
        });
      }}
    />
  );
};

export default page;
