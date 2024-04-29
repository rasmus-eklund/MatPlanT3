import { getRecipeById } from "~/server/api/recipes";
import RecipeForm from "../../_components/RecipeForm";

type Props = { params: { id: string } };
const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={async (recipe) => {
        "use server";
        console.log(recipe);
      }}
    />
  );
};

export default page;
