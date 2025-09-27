import { addItem, getAllItems, searchItem } from "~/server/api/items";
import { getAllStores, getStoreBySlug } from "~/server/api/stores";
import StoreSelect from "./_components/StoreSelect";
import DeleteCheckedItems from "./_components/DeleteItems";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import type { Item, StoreWithItems } from "~/server/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ItemsCategory from "./_components/ItemsCategory";
import SearchModal from "~/components/common/SearchModal";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { type User } from "~/server/auth";

type Props = { searchParams?: Promise<{ store?: string }> };
const page = async (props: WithAuthProps & Props) => {
  const { user } = props;
  const searchParams = await props.searchParams;
  const [store, stores, items] = await Promise.all([
    getStoreBySlug({ slug: searchParams?.store, user }),
    getAllStores({ user }),
    getAllItems({ user }),
  ]);
  const { store_categories: categories } = store;
  const sorted = sortItemsByHomeAndChecked(items);

  return (
    <div className="flex flex-col gap-2 p-2">
      <section className="flex justify-between gap-2">
        <StoreSelect stores={stores} defaultStoreId={store.id} />
        <div className="flex items-center gap-2">
          <SearchModal
            title="vara"
            onSearch={searchItem}
            onSubmit={async (item) => {
              "use server";
              await addItem(item, user);
            }}
            user={user}
          />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="bg-c3 text-c5 rounded-md px-2 py-1">
            Din shoppinglista är tom.
          </p>
        )}
        <Tabs defaultValue="shoppinglist">
          <div className="flex items-center gap-1">
            <TabsList className="w-full p-0 md:w-fit">
              <TabsTrigger value="shoppinglist">
                Köpa {sorted.notHome.length}
              </TabsTrigger>
              <TabsTrigger value="checked">
                Checkade {sorted.checked.length}
              </TabsTrigger>
              <TabsTrigger value="home">Hemma {sorted.home.length}</TabsTrigger>
            </TabsList>
            <DeleteCheckedItems items={items} user={user} />
          </div>
          <TabsContent value="shoppinglist">
            <ItemContainer
              categories={categories}
              items={sorted.notHome}
              title="Inköpslista"
              user={user}
            />
          </TabsContent>
          <TabsContent value="checked">
            <ItemContainer
              categories={categories}
              items={sorted.checked}
              title="Checkade varor"
              user={user}
            />
          </TabsContent>
          <TabsContent value="home">
            <ItemContainer
              categories={categories}
              items={sorted.home}
              title="Varor hemma"
              user={user}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

const ItemContainer = ({
  title,
  items,
  categories,
  user,
}: {
  title: string;
  items: Item[];
  categories: StoreWithItems["store_categories"];
  user: User;
}) => {
  if (items.length !== 0) {
    return (
      <div>
        <h2 className="bg-c2 text-c5 rounded-md p-1 text-center text-lg font-bold">
          {title}
        </h2>
        <ul className="flex flex-col gap-5 rounded-md">
          {categories.map((category) => (
            <ItemsCategory
              key={category.id + title}
              category={category}
              items={items}
              user={user}
            />
          ))}
        </ul>
      </div>
    );
  }
};

export default WithAuth(page, false);
