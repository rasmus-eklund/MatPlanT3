import React from "react";
import RecipeView from "~/components/common/RecipeView";
import { getMenuItemById } from "~/server/api/menu";

type Props = { params: Promise<{ id: string }> };

const page = async (props: Props) => {
  const params = await props.params;

  const {
    id
  } = params;

  const recipes = await getMenuItemById(id);
  return (
    <div className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <RecipeView key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default page;
