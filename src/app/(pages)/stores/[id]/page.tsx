import { getStoreById, renameStore } from "~/server/api/stores";
import EditNameDialog from "~/components/common/EditNameDialog";
import { type NameType } from "~/zod/zodSchemas";
import SortableCategories from "./_components/SortableCategories";
import { WithAuth } from "~/components/common/withAuth";

type Props = { params: Promise<{ id: string }> };
const Stores = async (props: Props) => {
  const { id } = await props.params;
  const store = await getStoreById({ id });
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
      <SortableCategories categories={store.store_categories} storeId={store.id} />
    </div>
  );
};

export default WithAuth(Stores, false, async (props) => {
  const params = await props.params;
  return `/stores/${params.id}`;
});
