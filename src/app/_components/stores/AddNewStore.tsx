"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { FormEvent } from "react";
import LoadingSpinner from "../LoadingSpinner";
import Icon from "../icons/Icon";

const AddNewStore = () => {
  const router = useRouter();
  const { mutate: addStore, isLoading } = api.store.create.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleAddStore = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addStore();
  };

  return (
    <div className="flex h-10 items-center justify-between rounded-md bg-c2 p-2 text-xl text-c4">
      <p className="text-c4">Lägg till ny affär</p>
      <form onSubmit={handleAddStore} className="flex">
        <button>
          {isLoading ? (
            <LoadingSpinner className="h-6 w-6" />
          ) : (
            <Icon icon="plus" />
          )}
        </button>
      </form>
    </div>
  );
};

export default AddNewStore;
