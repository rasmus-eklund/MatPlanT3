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
      onSubmit={async (updatedRecipe, oldRecipe) => {
        "use server";
        const old = oldRecipe.groups.flatMap((g) =>
          g.ingredients.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            unit: i.unit,
            order: i.order,
            ingredientId: i.ingredientId,
            groupId: g.id,
          })),
        );
        const updated = updatedRecipe.groups.flatMap((g) =>
          g.ingredients.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            unit: i.unit,
            order: i.order,
            ingredientId: i.ingredientId,
            groupId: g.id,
          })),
        );
        const ingredients = findArrayDifferences(old, updated);
        const contained = findArrayDifferences(
          oldRecipe.contained,
          updatedRecipe.contained,
        );
        const groups = findArrayDifferences(
          oldRecipe.groups.map((g) => ({
            id: g.id,
            name: g.name,
            order: g.order,
          })),
          updatedRecipe.groups.map((g) => ({
            id: g.id,
            name: g.name,
            order: g.order,
          })),
        );
        await updateRecipe({
          recipe: updatedRecipe,
          ingredients,
          contained,
          groups,
        });
      }}
    />
  );
};

export default page;
