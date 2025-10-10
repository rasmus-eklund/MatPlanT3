import { addItem, getAllItems, searchItem } from "~/server/api/items";
import { getAllStores, getStoreBySlugOrFirst } from "~/server/api/stores";
import StoreSelect from "./_components/StoreSelect";
import DeleteCheckedItems from "./_components/DeleteItems";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import type {
  Item,
  Stores,
  StoreWIthCategories,
  StoreWithItems,
} from "~/server/shared";
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
    getStoreBySlugOrFirst({ slug: searchParams?.store, user }),
    getAllStores({ user }),
    getAllItems({ user }),
  ]);
  const { store_categories: categories } = store;
  const sorted = sortItemsByHomeAndChecked(items);
  const rest = { store, stores, user };

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <Tabs className="flex flex-1 flex-col" defaultValue="shoppinglist">
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
        </div>
        <TabsContent value="shoppinglist">
          <ItemContainer
            categories={categories}
            items={sorted.notHome}
            title="Köpa"
            {...rest}
          />
        </TabsContent>
        <TabsContent className="flex min-h-0 flex-1" value="checked">
          <ItemContainer
            categories={categories}
            items={sorted.checked}
            title="Checkade"
            clearable
            {...rest}
          />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="home">
          <ItemContainer
            categories={categories}
            items={sorted.home}
            title="Hemma"
            {...rest}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ItemContainer = ({
  title,
  items,
  categories,
  user,
  store,
  stores,
  clearable = false,
}: {
  title: string;
  items: Item[];
  categories: StoreWithItems["store_categories"];
  user: User;
  store: StoreWIthCategories;
  stores: Stores;
  clearable?: boolean;
}) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="bg-c2 text-c5 relative flex h-10 w-full items-center justify-between rounded-md px-3 py-1">
        <StoreSelect stores={stores} defaultStoreId={store.id} />
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {clearable && <DeleteCheckedItems items={items} user={user} />}
          <SearchModal
            title="vara"
            addIcon
            onSearch={searchItem}
            onSubmit={async (item) => {
              "use server";
              await addItem(item, user);
            }}
            user={user}
          />
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-c5 flex h-full items-center justify-center rounded-md px-2 py-1 text-center">
          <p>Här var det tomt...</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 rounded-md">
          {categories.map((category) => (
            <ItemsCategory
              key={category.id + title}
              category={category}
              items={items}
              user={user}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default WithAuth(page, false);
