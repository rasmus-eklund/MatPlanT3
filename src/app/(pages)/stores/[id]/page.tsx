import SortableCategories from "~/app/(pages)/stores/components/SortableCategories";
import StoreName from "~/app/(pages)/stores/components/StoreName";
import LoadingSpinner from "~/app/_components/LoadingSpinner";
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
