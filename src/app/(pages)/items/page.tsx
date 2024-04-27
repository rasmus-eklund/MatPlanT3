import { addItem, getAllItems } from "~/server/api/items";
import { getAllStores, getStoreBySlug } from "~/server/api/stores";
import StoreSelect from "./_components/StoreSelect";
import ItemsCategory from "./_components/ItemsCategory";
import SearchItem from "~/components/common/SearchItem";
import DeleteCheckedItems from "./_components/DeleteItems";
export const dynamic = "force-dynamic";

type Props = { searchParams?: { store?: string } };
const page = async ({ searchParams }: Props) => {
  const store = await getStoreBySlug(searchParams?.store);
  const stores = await getAllStores();
  const items = await getAllItems();

  const itemsHome = items.filter((i) => i.home);
  const itemsNotHome = items.filter((i) => !i.home);

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex justify-between">
        <StoreSelect stores={stores} defaultStoreId={store.id} />
        <div className="flex items-center gap-2">
          <DeleteCheckedItems items={items} />
          <SearchItem onSubmit={addItem} />
        </div>
      </div>
      <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
        {store.store_categories.map((category) => (
          <ItemsCategory
            key={category.id + "_notHome"}
            category={category}
            items={itemsNotHome}
          />
        ))}
        {items.length === 0 && (
          <li className="rounded-md bg-c3 px-2 py-1 text-c5">
            Din shoppinglista är tom.
          </li>
        )}
      </ul>
      {itemsHome.length !== 0 && (
        <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
          <h2 className="rounded-md bg-c2 p-1 text-center text-lg font-bold text-c5">
            Varor hemma
          </h2>
          {store.store_categories.map((category) => (
            <ItemsCategory
              key={category.id + "_Home"}
              category={category}
              items={itemsHome}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default page;
