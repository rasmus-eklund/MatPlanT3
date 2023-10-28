import SortableCategories from "~/app/_components/stores/SortableCategories";
import StoreName from "~/app/_components/stores/StoreName";
import { api } from "~/trpc/server";

type Props = { params: { id: string } };
const Stores = async ({ params: { id } }: Props) => {
  const store = await api.store.getById.query({ id });

  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      <StoreName id={id} name={store.name} />
      <SortableCategories store={store} />
    </div>
  );
};

export default Stores;
