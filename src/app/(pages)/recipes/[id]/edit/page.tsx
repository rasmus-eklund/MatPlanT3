import { getRecipeById, getRecipeDeleteParents, updateRecipe } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";
import { findArrayDifferences } from "~/lib/utils";
import { WithAuth } from "~/components/common/withAuth";
import { notFound } from "next/navigation";
import { DeleteImpactDescription } from "../../_components/DeleteImpactDescription";

type Props = { params: Promise<{ id: string }> };
const page = async (props: Props) => {
  const { id } = await props.params;
  const recipe = await getRecipeById({ id });
  if (!recipe.yours) {
    notFound();
  }
  const parents = await getRecipeDeleteParents({ id });
  return (
    <RecipeForm
      recipe={recipe}
      deleteDescription={<DeleteImpactDescription parents={parents} />}
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
        const contained = findArrayDifferences(oldRecipe.contained, updatedRecipe.contained);
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

export default WithAuth(page, false, async (props) => {
  const { id } = await props.params;
  return `/recipes/${id}/edit`;
});
