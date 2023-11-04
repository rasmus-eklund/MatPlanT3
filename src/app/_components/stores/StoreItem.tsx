"use client";
import Link from "next/link";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Icon from "../icons/Icon";

type Props = {
  store: {
    id: string;
    name: string;
  };
};

const StoreItem = ({ store: { id, name } }: Props) => {
  const router = useRouter();
  const { mutate: deleteStore, isLoading: deleting } =
    api.store.remove.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (e) => {
        const msg = e.data?.zodError?.fieldErrors.content;
        console.log(msg);
        if (msg?.[0]) {
          toast.error(msg[0]);
        }
      },
    });

  return (
    <li className="flex h-10 items-center justify-between rounded-md bg-c2 p-2">
      <Link className="text-xl text-c5 hover:text-c3" href={`/stores/${id}`}>
        {name}
      </Link>
      <button disabled={deleting} onClick={() => deleteStore({ id })}>
        <Icon icon={"delete"} />
      </button>
    </li>
  );
};

export default StoreItem;
