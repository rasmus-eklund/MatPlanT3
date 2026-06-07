import { notFound } from "next/navigation";
import { getAllStoresWithCategories } from "~/server/api/stores";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getAllItems } from "~/server/api/items";
import ItemTabs from "./_components/ItemTabs";

const page = async ({ user }: WithAuthProps) => {
  const [stores, items] = await Promise.all([
    getAllStoresWithCategories(),
    getAllItems(),
  ]);
  const defaultStore = stores.find((store) => store.default) ?? stores[0];
  if (!defaultStore) notFound();

  return (
    <ItemTabs
      items={items}
      user={user}
      defaultStoreId={defaultStore.id}
      stores={stores}
    />
  );
};

export default WithAuth(page, false, async () => "/items");
