"use client";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import type { FormEvent } from "react";
import Icon from "~/icons/Icon";
import IconStyle from "~/icons/standardIconStyle";
import { ClipLoader } from "react-spinners";

const AddNewStore = () => {
  const utils = api.useUtils();
  const { mutate: addStore, isLoading } = api.store.create.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      utils.store.getAll.invalidate();
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
        {isLoading ? (
          <ClipLoader />
        ) : (
          <button>
            <Icon className={IconStyle} icon="plus" />
          </button>
        )}
      </form>
    </div>
  );
};

export default AddNewStore;
