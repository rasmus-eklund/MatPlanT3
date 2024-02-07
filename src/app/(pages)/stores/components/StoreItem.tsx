"use client";
import Link from "next/link";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import Icon from "~/icons/Icon";
import { useRef } from "react";
import Modal from "~/app/_components/Modal";
import Button from "~/app/_components/Button";

type Props = {
  store: {
    id: string;
    name: string;
  };
};

const StoreItem = ({ store: { id, name } }: Props) => {
  const utils = api.useUtils();
  const modal = useRef<HTMLDialogElement>(null);
  const toggleModal = () => {
    if (!modal.current) {
      return;
    }
    modal.current.hasAttribute("open")
      ? modal.current.close()
      : modal.current.showModal();
  };
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
      <button disabled={deleting} onClick={toggleModal}>
        <Icon icon={"delete"} className="w-7 fill-c4" />
      </button>
      <Modal toggleModal={toggleModal} ref={modal}>
        <div className="flex flex-col gap-4 border border-c5 p-5">
          <p className="text-center text-c5">Ta bort affär?</p>
          <div className="flex gap-5">
            <Button onClick={toggleModal}>Avbryt</Button>
            <Button
              callToAction
              disabled={deleting}
              onClick={() => deleteStore({ id })}
            >
              Ta bort
            </Button>
          </div>
        </div>
      </Modal>
    </li>
  );
};

export default StoreItem;
