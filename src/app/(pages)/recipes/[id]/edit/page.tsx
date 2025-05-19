import { getRecipeById, updateRecipe } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";
import { findArrayDifferences } from "~/lib/utils";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

type Props = { params: Promise<{ id: string }> };
const page = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const { user } = props;
  const recipe = await getRecipeById({ id, user });
  return (
    <RecipeForm
      user={user}
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
          user,
          recipe: updatedRecipe,
          ingredients,
          contained,
          groups,
        });
      }}
    />
  );
};

export default WithAuth(page, false);
