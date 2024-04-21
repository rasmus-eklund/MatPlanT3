import { getAllStores } from "~/server/api/stores";
import StoreItem from "./_components/StoreItem";
import AddNewStore from "./_components/AddNewStore";

const Stores = async () => {
  const stores = await getAllStores();
  const deletable = stores.length !== 1;
  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      <h2 className="text-xl text-c5">Dina butiker</h2>
      <ul className="flex flex-col gap-2">
        {stores.map((store) => (
          <StoreItem key={store.id} store={store} deleteable={deletable} />
        ))}
      </ul>
      <div className="mt-8">
        <AddNewStore />
      </div>
    </div>
  );
};

export default Stores;
