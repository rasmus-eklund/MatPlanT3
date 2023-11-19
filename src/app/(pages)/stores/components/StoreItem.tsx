"use client";
import Link from "next/link";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Icon from "~/icons/Icon";

type Props = {
  store: {
    id: string;
    name: string;
  };
};

const StoreItem = ({ store: { id, name } }: Props) => {
  const utils = api.useUtils();
  const { mutate: deleteStore, isLoading: deleting } =
    api.store.remove.useMutation({
      onSuccess: () => {
        utils.store.getAll.invalidate();
      },
      onError: (e) => {
        const msg = e.data?.zodError?.fieldErrors.content;
        if (msg?.[0]) {
          toast.error(msg[0]);
        }
      },
    });

  return (
    <li className="flex h-10 items-center justify-between rounded-md bg-c2 p-2">
      <Link className="text-xl text-c5 md:hover:text-c3" href={`/stores/${id}`}>
        {name}
      </Link>
      <button disabled={deleting} onClick={() => deleteStore({ id })}>
        <Icon icon={"delete"} className="w-7 fill-c4" />
      </button>
    </li>
  );
};

export default StoreItem;
