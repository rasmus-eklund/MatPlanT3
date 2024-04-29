import { getRecipeById } from "~/server/api/recipes";
import RecipeComponent from "./_components/recipe";

type Props = { params: { id: string } };

const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <div className="flex flex-col gap-5">
      <RecipeComponent recipe={recipe} />
    </div>
  );
};

export default page;
