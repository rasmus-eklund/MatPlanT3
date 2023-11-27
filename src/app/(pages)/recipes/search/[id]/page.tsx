import ShowRecipe from "~/app/(pages)/recipes/components/ShowRecipe";
import { api } from "~/trpc/server";
import HandleRecipe from "../_components/HandleRecipe";

const Recipe = async ({ params: { id } }: { params: { id: string } }) => {
  const recipe = await api.recipe.getById.query(id);
  return (
    <div className="flex flex-col bg-c3 gap-4 py-2">
      <ShowRecipe recipe={recipe} />
      <HandleRecipe id={id} yours={recipe.yours} />
    </div>
  );
};

export default Recipe;
