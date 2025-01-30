import { addItem, getAllItems } from "~/server/api/items";
import { getAllStores, getStoreBySlug } from "~/server/api/stores";
import StoreSelect from "./_components/StoreSelect";
import DeleteCheckedItems from "./_components/DeleteItems";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import ItemContainer from "./_components/ItemContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AddItem from "./_components/AddItem";
export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ store?: string }> };
const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const [store, stores, items] = await Promise.all([
    getStoreBySlug(searchParams?.store),
    getAllStores(),
    getAllItems(),
  ]);
  const { store_categories: categories } = store;
  const sorted = sortItemsByHomeAndChecked(items);

  return (
    <div className="flex flex-col gap-2 p-2">
      <section className="flex justify-between gap-2">
        <StoreSelect stores={stores} defaultStoreId={store.id} />
        <div className="flex items-center gap-2">
          <DeleteCheckedItems items={items} />
          <AddItem addItem={addItem} />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="rounded-md bg-c3 px-2 py-1 text-c5">
            Din shoppinglista är tom.
          </p>
        )}
        <Tabs defaultValue="shoppinglist">
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="shoppinglist">
              Köpa {sorted.notHome.length}
            </TabsTrigger>
            <TabsTrigger value="checked">
              Checkade {sorted.checked.length}
            </TabsTrigger>
            <TabsTrigger value="home">Hemma {sorted.home.length}</TabsTrigger>
          </TabsList>
          <TabsContent value="shoppinglist">
            <ItemContainer
              categories={categories}
              items={sorted.notHome}
              title="Inköpslista"
            />
          </TabsContent>
          <TabsContent value="checked">
            <ItemContainer
              categories={categories}
              items={sorted.checked}
              title="Checkade varor"
            />
          </TabsContent>
          <TabsContent value="home">
            <ItemContainer
              categories={categories}
              items={sorted.home}
              title="Varor hemma"
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default page;
