import { getStoreById, renameStore } from "~/server/api/stores";
import EditNameDialog from "~/components/common/EditNameDialog";
import { type NameType } from "~/zod/zodSchemas";
import SortableCategories from "./_components/SortableCategories";

type Props = { params: Promise<{ id: string }> };
const Stores = async (props: Props) => {
  const { id } = await props.params;
  const store = await getStoreById(id);
  const onSubmit = async ({ name }: NameType) => {
    "use server";
    await renameStore({ id, name });
  };
  return (
    <div className="bg-c3 flex flex-col gap-2 rounded-md p-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-c5 text-xl">{store.name}</h1>
        <EditNameDialog
          info={{ title: "butiksnamn", description: "Byt namnet på din butik" }}
          name={store.name}
          onSubmit={onSubmit}
        />
      </div>
      <SortableCategories
        categories={store.store_categories}
        storeId={store.id}
      />
    </div>
  );
};

export default Stores;
