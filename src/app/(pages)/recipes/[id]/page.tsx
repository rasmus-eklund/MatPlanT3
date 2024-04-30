import { getRecipeById, removeRecipe } from "~/server/api/recipes";
import RecipeView from "~/components/common/RecipeView";
import DeleteDialog from "~/components/common/DeleteDialog";
import DeleteButton from "~/components/common/DeleteButton";

type Props = { params: { id: string } };

const page = async ({ params: { id } }: Props) => {
  const recipe = await getRecipeById(id);
  return (
    <div className="flex flex-col gap-5">
      <RecipeView recipe={recipe}>
        <div>
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
      </RecipeView>
    </div>
  );
};

export default page;
