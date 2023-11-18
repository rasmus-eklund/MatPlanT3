"use client";
import SortableCategories from "~/app/(pages)/stores/components/SortableCategories";
import StoreName from "~/app/(pages)/stores/components/StoreName";
import LoadingSpinner from "~/app/_components/LoadingSpinner";
import { api } from "~/trpc/react";

type Props = { params: { id: string } };
const Stores = ({ params: { id } }: Props) => {
  const {
    data: store,
    isLoading,
    isSuccess,
    isError,
  } = api.store.getById.useQuery({ id });

  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      {isLoading && <LoadingSpinner />}
      {isError && <p>Något gick fel...</p>}
      {isSuccess && <StoreName id={id} name={store.name} />}
      {isSuccess && <SortableCategories store={store} />}
    </div>
  );
};

export default Stores;
