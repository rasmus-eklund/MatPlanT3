import React from "react";
import RecipeView from "~/components/common/RecipeView";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getMenuItemById } from "~/server/api/menu";

type Props = { params: Promise<{ id: string }> };

const Page = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const recipes = await getMenuItemById({ id, user: props.user });
  return (
    <div className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <RecipeView key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default WithAuth(Page, false);
