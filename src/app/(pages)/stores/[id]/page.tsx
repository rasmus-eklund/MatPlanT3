import { getStoreById, renameStore } from "~/server/api/stores";
import SortableCategories from "./_components/SortableCategories";
import EditNameDialog from "~/components/common/EditNameDialog";
import { type NameType } from "~/zod/zodSchemas";

type Props = { params: { id: string } };
const Stores = async ({ params: { id } }: Props) => {
  const store = await getStoreById(id);
  const onSubmit = async ({ name }: NameType) => {
    "use server";
    await renameStore({ id, name });
  };
  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl text-c5">{store.name}</h1>
        <EditNameDialog
          info={{ title: "butiksnamn", description: "Byt namnet på din butik" }}
          name={store.name}
          onSubmit={onSubmit}
        />
      </div>
      <SortableCategories
        store_categories={store.store_categories}
        storeId={store.id}
      />
    </div>
  );
};

export default Stores;
