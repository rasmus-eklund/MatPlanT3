import React from "react";
import RecipeView from "~/components/common/RecipeView";
import { getMenuItemById } from "~/server/api/menu";

type Props = { params: { id: string } };

const page = async ({ params: { id } }: Props) => {
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
