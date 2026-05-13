import {
  getRecipeById,
  getRecipeDeleteImpact,
  removeRecipe,
} from "~/server/api/recipes";
import RecipeView from "~/components/common/RecipeView";
import DeleteDialog from "~/components/common/DeleteDialog";
import DeleteButton from "~/components/common/DeleteButton";
import AddToMenu from "../_components/AddToMenu";
import CopyRecipe from "../_components/CopyRecipe";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import BackButton from "~/components/common/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getRescaledRecipes } from "~/server/backendHelpers";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

const recipeListFormatter = new Intl.ListFormat("sv", {
  style: "long",
  type: "conjunction",
});

const formatRecipeNames = (recipes: { name: string }[]) =>
  recipeListFormatter.format(recipes.map((recipe) => recipe.name));

const page = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const { user } = props;
  const recipe = await getRecipeById({ id, user });
  const deleteImpact = recipe.yours
    ? await getRecipeDeleteImpact({ id, user })
    : { parents: [], children: [] };

  const recipes = recipe.contained.length
    ? await getRescaledRecipes(id, recipe.quantity, [], user)
    : [];
  const containedRecipeTabs = recipes
    .filter((r) => r.id !== id)
    .map((recipe, index) => ({
      recipe,
      tabId: `${index}-${recipe.id}`,
    }));
  return (
    <RecipeView recipe={recipe}>
      {containedRecipeTabs.length > 0 && (
        <div className="flex flex-col gap-5 pt-4">
          <h2 className="text-c5 text-lg">Kopplade recept</h2>
          <Tabs defaultValue={containedRecipeTabs[0]?.tabId}>
            <TabsList className="gap-1">
              {containedRecipeTabs.map(({ recipe, tabId }) => (
                <TabsTrigger key={tabId} value={tabId}>
                  {recipe.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {containedRecipeTabs.map(({ recipe, tabId }) => (
              <TabsContent key={tabId} value={tabId}>
                <RecipeView recipe={recipe} className="p-0" />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
      <div className="flex justify-between">
        <BackButton />
        {recipe.yours ? (
          <div className="flex items-center gap-2">
            <AddToMenu id={recipe.id} user={user} />
            <DeleteDialog
              info={{
                title: "recept",
                description: <DeleteImpactDescription impact={deleteImpact} />,
              }}
            >
              <form
                action={async () => {
                  "use server";
                  await removeRecipe({ id, user, name: recipe.name });
                }}
              >
                <DeleteButton icon={false} />
              </form>
            </DeleteDialog>
          </div>
        ) : (
          <CopyRecipe id={id} user={user} name={recipe.name} />
        )}
      </div>
    </RecipeView>
  );
};

const DeleteImpactDescription = ({
  impact,
}: {
  impact: Awaited<ReturnType<typeof getRecipeDeleteImpact>>;
}) => {
  const { parents, children } = impact;
  return (
    <div className="flex flex-col gap-2">
      {!!parents.length && (
        <span>
          Receptet används i {formatRecipeNames(parents)}. Om du fortsätter tas
          det bort från dessa recept.
        </span>
      )}
      {!!children.length && (
        <span>
          Receptet innehåller {formatRecipeNames(children)}. Om du fortsätter
          tas kopplingarna till dessa recept bort.
        </span>
      )}
    </div>
  );
};

export default WithAuth(page, false, async (props) => {
  const params = await props.params;
  return `/recipes/${params.id}`;
});
