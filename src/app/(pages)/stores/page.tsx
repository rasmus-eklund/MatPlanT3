"use client";
import { ClipLoader } from "react-spinners";
import AddNewStore from "~/app/(pages)/stores/components/AddNewStore";
import StoreItem from "~/app/(pages)/stores/components/StoreItem";
import { api } from "~/trpc/react";

const Stores = () => {
  const { data: stores, isLoading, isSuccess } = api.store.getAll.useQuery();

  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      <h2 className="text-xl text-c5">Butiker</h2>
      <ul className="flex flex-col gap-2">
        {isLoading && <ClipLoader />}
        {isSuccess && stores.map((s) => <StoreItem key={s.id} store={s} />)}
        <li>
          <AddNewStore />
        </li>
      </ul>
    </div>
  );
};

export default Stores;
