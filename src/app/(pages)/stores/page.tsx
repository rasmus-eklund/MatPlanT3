import { getAllStores } from "~/server/api/stores";
import StoreItem from "./_components/StoreItem";
import AddNewStore from "./_components/AddNewStore";
import { WithAuth } from "~/components/common/withAuth";

const Stores = async () => {
  const stores = await getAllStores();
  const deletable = stores.length !== 1;
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-c2 px-2 py-1 text-lg md:px-3">Butiker</h2>
      <ul className="space-y-2 px-1 md:px-2">
        {stores
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((store) => (
            <StoreItem key={store.id} store={store} deleteable={deletable} />
          ))}
      </ul>
      <AddNewStore stores={stores.map((i) => i.name)} />
    </div>
  );
};

export default WithAuth(Stores, false, async () => "/stores");
