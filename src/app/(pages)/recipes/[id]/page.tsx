import { getRecipeById, removeRecipe } from "~/server/api/recipes";
import RecipeView from "~/components/common/RecipeView";
import DeleteDialog from "~/components/common/DeleteDialog";
import DeleteButton from "~/components/common/DeleteButton";
import Link from "next/link";
import { capitalize } from "~/lib/utils";
import { unitsAbbr } from "~/lib/constants/units";
import { type Recipe } from "~/server/shared";
import AddToMenu from "../_components/AddToMenu";
import CopyRecipe from "../_components/CopyRecipe";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import BackButton from "~/components/common/BackButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

const page = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const { user } = props;
  const recipe = await getRecipeById({ id, user });
  return (
    <div className="flex flex-col gap-5">
      <RecipeView recipe={recipe}>
        <ContainedRecipes contained={recipe.contained} />
        <div className="flex justify-between">
          <BackButton />
          {recipe.yours ? (
            <div className="flex items-center gap-2">
              <AddToMenu id={recipe.id} user={user} />
              <DeleteDialog info={{ title: "recept" }}>
                <form
                  action={async () => {
                    "use server";
                    await removeRecipe({ id, user });
                  }}
                >
                  <DeleteButton icon={false} />
                </form>
              </DeleteDialog>
            </div>
          ) : (
            <CopyRecipe id={id} user={user} />
          )}
        </div>
      </RecipeView>
    </div>
  );
};

type ContainedProps = { contained: Recipe["contained"] };
const ContainedRecipes = ({ contained }: ContainedProps) => {
  if (!!contained.length)
    return (
      <>
        <h2 className="text-c5 text-lg">Kopplade recept</h2>
        <ul className="bg-c4 space-y-1 rounded-md p-1">
          {contained.map(({ id, name, quantity, recipeId, unit }) => (
            <li
              className="bg-c2 flex items-center justify-between rounded-md p-2"
              key={id}
            >
              <Link href={`/recipes/${recipeId}`}>{capitalize(name)}</Link>
              <span>
                {quantity} {unitsAbbr[unit]}
              </span>
            </li>
          ))}
        </ul>
      </>
    );
};
export default WithAuth(page, false);
