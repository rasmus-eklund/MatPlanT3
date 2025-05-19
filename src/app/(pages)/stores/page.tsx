import { getAllStores } from "~/server/api/stores";
import StoreItem from "./_components/StoreItem";
import AddNewStore from "./_components/AddNewStore";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

const Stores = async ({ user }: WithAuthProps) => {
  const stores = await getAllStores({ user });
  const deletable = stores.length !== 1;
  return (
    <div className="bg-c3 flex flex-col gap-2 rounded-md p-3">
      <h2 className="text-c5 text-xl">Dina butiker</h2>
      <ul className="flex flex-col gap-2">
        {stores.map((store) => (
          <StoreItem
            key={store.id}
            store={store}
            deleteable={deletable}
            user={user}
          />
        ))}
      </ul>
      <div className="mt-8">
        <AddNewStore stores={stores.map((i) => i.name)} user={user} />
      </div>
    </div>
  );
};

export default WithAuth(Stores, false);
