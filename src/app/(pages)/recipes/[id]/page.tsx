import { getRecipeById, getRecipeDeleteParents } from "~/server/api/recipes";
import RecipeView from "~/components/common/RecipeView";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getRescaledRecipes } from "~/server/recipes/recipeScaling";
import RecipeDetailActions from "../_components/RecipeDetailActions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
};

const page = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const { user } = props;
  const recipe = await getRecipeById({ id });
  const parents = recipe.yours ? await getRecipeDeleteParents({ id }) : [];
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
    <RecipeView
      recipe={recipe}
      actions={
        <RecipeDetailActions
          recipe={recipe}
          deleteDescription={<DeleteImpactDescription parents={parents} />}
        />
      }
    >
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
    </RecipeView>
  );
};

const recipeListFormatter = new Intl.ListFormat("sv", {
  style: "long",
  type: "conjunction",
});

const formatRecipeNames = (recipes: { name: string }[]) =>
  recipeListFormatter
    .formatToParts(recipes.map((recipe) => recipe.name))
    .map((part, index) =>
      part.type === "element" ? (
        <strong key={index} className="text-foreground font-semibold">
          {part.value}
        </strong>
      ) : (
        part.value
      ),
    );

const DeleteImpactDescription = ({
  parents,
}: {
  parents: Awaited<ReturnType<typeof getRecipeDeleteParents>>;
}) => {
  return (
    <>
      <span className="block">
        Är du säker på att du vill ta bort receptet?
      </span>
      {!!parents.length && (
        <span className="mt-2 block">
          Receptet används i andra recept. Om du tar bort det kommer dessa
          recept inte längre innehålla receptet: {formatRecipeNames(parents)}.
        </span>
      )}
    </>
  );
};

export default WithAuth(page, false, async (props) => {
  const params = await props.params;
  return `/recipes/${params.id}`;
});
