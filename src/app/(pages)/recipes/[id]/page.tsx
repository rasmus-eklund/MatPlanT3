import { getRecipeById } from "~/server/api/recipes";
import RecipeView from "./_components/RecipeView";

type Props = { params: { id: string } };

const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <div className="flex flex-col gap-5">
      <RecipeView recipe={recipe} />
    </div>
  );
};

export default page;
