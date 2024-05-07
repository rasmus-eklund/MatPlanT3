import { getRecipeById, updateRecipe } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";
import { extractGroups, findArrayDifferences } from "~/lib/utils";

type Props = { params: { id: string } };
const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={async (data) => {
        "use server";
        const ext = extractGroups({ groups: data.groups, recipeId: data.id });
        const ings: (typeof ext)["ingredients"] = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const { group: _, ...ing } of recipe.ingredients) {
          ings.push(ing);
        }
        const ingredients = findArrayDifferences(ings, ext.ingredients);
        const contained = findArrayDifferences(
          recipe.contained,
          data.contained,
        );
        const groups = findArrayDifferences(recipe.groups, ext.groups);
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
