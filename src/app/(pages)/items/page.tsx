import { addItem, getAllItems } from "~/server/api/items";
import { getAllStores, getStoreBySlug } from "~/server/api/stores";
import StoreSelect from "./_components/StoreSelect";
import DeleteCheckedItems from "./_components/DeleteItems";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import ItemContainer from "./_components/ItemContainer";
import AddItem from "./_components/AddItem";
export const dynamic = "force-dynamic";

type Props = { searchParams?: { store?: string } };
const page = async ({ searchParams }: Props) => {
  const [store, stores, items] = await Promise.all([
    getStoreBySlug(searchParams?.store),
    getAllStores(),
    getAllItems(),
  ]);
  const { store_categories: categories } = store;
  const sorted = sortItemsByHomeAndChecked(items);

  return (
    <div className="space-y-4 p-2">
      <section className="flex justify-between gap-2">
        <StoreSelect stores={stores} defaultStoreId={store.id} />
        <div className="flex items-center gap-2">
          <DeleteCheckedItems items={items} />
          <AddItem addItem={addItem} />
        </div>
      </section>
      <section className="space-y-6">
        {items.length === 0 && (
          <p className="rounded-md bg-c3 px-2 py-1 text-c5">
            Din shoppinglista är tom.
          </p>
        )}
        <ItemContainer
          categories={categories}
          items={sorted.notHome}
          title="Inköpslista"
        />
        <ItemContainer
          categories={categories}
          items={sorted.home}
          title="Varor Hemma"
        />
        <ItemContainer
          categories={categories}
          items={sorted.checked}
          title="Checkade Varor"
        />
      </section>
    </div>
  );
};

export default page;
