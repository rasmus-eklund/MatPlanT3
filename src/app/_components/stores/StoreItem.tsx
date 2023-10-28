"use client";
import Link from "next/link";
import DeleteButton from "../buttons/DeleteButton";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import TrashIcon from "../icons/TrashIcon";

type Props = {
  store: {
    id: string;
    name: string;
  };
};

const StoreItem = ({ store: { id, name } }: Props) => {
  const router = useRouter();
  const { mutate: deleteStore, isLoading } = api.store.remove.useMutation({
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
      <button onClick={() => deleteStore({ id })}>
        <TrashIcon
          className={`h-6 w-6 fill-c5 transition-all hover:scale-125 ${
            isLoading && "scale-0"
          }`}
        />
      </button>
    </li>
  );
};

export default StoreItem;
