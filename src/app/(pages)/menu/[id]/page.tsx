import { notFound } from "next/navigation";
import RecipeView from "~/components/common/RecipeView";
import { WithAuth } from "~/components/common/withAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getMenuItemById } from "~/server/api/menu";
import MenuDetailActions from "../_components/MenuDetailActions";

type Props = { params: Promise<{ id: string }> };

const Page = async (props: Props) => {
  const { id } = await props.params;
  const recipes = await getMenuItemById({ id });
  const first = recipes[0];
  if (!first) notFound();
  const containedRecipeTabs = recipes
    .filter((r) => r.id !== first.id)
    .map((recipe, index) => ({
      recipe,
      tabId: `${index}-${recipe.id}`,
    }));

  return (
    <RecipeView recipe={first} actions={<MenuDetailActions recipe={first} />}>
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
                <RecipeView
                  recipe={recipe}
                  className="p-0"
                  actions={<MenuDetailActions recipe={recipe} back={false} />}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </RecipeView>
  );
};

export default WithAuth(Page, false, async (props) => {
  const params = await props.params;
  return `/menu/${params.id}`;
});
