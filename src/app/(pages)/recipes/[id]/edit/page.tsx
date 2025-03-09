import { getRecipeById, updateRecipe } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";
import { findArrayDifferences } from "~/lib/utils";

type Props = { params: Promise<{ id: string }> };
const page = async (props: Props) => {
  const params = await props.params;

  const { id } = params;

  const recipe = await getRecipeById(id);
  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={async (data) => {
        "use server";
        const ingredients = findArrayDifferences(
          recipe.groups.flatMap((g) => g.ingredients),
          data.groups.flatMap((g) => g.ingredients),
        );
        const contained = findArrayDifferences(
          recipe.contained,
          data.contained,
        );
        const groups = findArrayDifferences(recipe.groups, data.groups);
        await updateRecipe({
          recipe: data,
          ingredients,
          contained,
          groups,
        });
      }}
    />
  );
};

export default page;
