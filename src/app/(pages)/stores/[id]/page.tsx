import { getStoreById, renameStore } from "~/server/api/stores";
import EditNameDialog from "~/components/common/EditNameDialog";
import { type NameType } from "~/zod/zodSchemas";
import SortableCategories from "./_components/SortableCategories";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

type Props = { params: Promise<{ id: string }> };
const Stores = async (props: WithAuthProps & Props) => {
  const { id } = await props.params;
  const { user } = props;
  const store = await getStoreById({ id, user });
  const onSubmit = async ({ name }: NameType) => {
    "use server";
    await renameStore({ id, name, user });
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
        user={user}
      />
    </div>
  );
};

export default WithAuth(Stores, false);
