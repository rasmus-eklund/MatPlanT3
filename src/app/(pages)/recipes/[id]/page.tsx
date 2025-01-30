import { getRecipeById, removeRecipe } from "~/server/api/recipes";
import RecipeView from "~/components/common/RecipeView";
import DeleteDialog from "~/components/common/DeleteDialog";
import DeleteButton from "~/components/common/DeleteButton";
import Link from "next/link";
import { capitalize } from "~/lib/utils";
import { unitsAbbr } from "~/lib/constants/units";
import { type Recipe } from "~/server/shared";
import BackButton from "~/components/common/BackButton";
import AddToMenu from "../_components/AddToMenu";
import CopyRecipe from "../_components/CopyRecipe";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<{ from?: string }> };

const page = async (props: Props) => {
  const params = await props.params;

  const {
    id
  } = params;

  const recipe = await getRecipeById(id);
  return (
    <div className="flex flex-col gap-5">
      <RecipeView recipe={recipe}>
        <ContainedRecipes contained={recipe.contained} />
        <div className="flex justify-between">
          <BackButton />
          {recipe.yours ? (
            <div className="flex items-center gap-2">
              <AddToMenu id={recipe.id} />
              <DeleteDialog info={{ title: "recept" }}>
                <form
                  action={async () => {
                    "use server";
                    await removeRecipe(id);
                  }}
                >
                  <DeleteButton icon={false} />
                </form>
              </DeleteDialog>
            </div>
          ) : (
            <CopyRecipe id={id} />
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
        <h2 className="text-lg text-c5">Kopplade recept</h2>
        <ul className="space-y-1 rounded-md bg-c4 p-1">
          {contained.map(({ id, name, quantity, recipeId, unit }) => (
            <li
              className="flex items-center justify-between rounded-md bg-c2 p-2"
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
export default page;
