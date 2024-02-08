"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import Icon from "~/icons/Icon";
import { api } from "~/trpc/react";

type Props = { id: string; name: string };

const DeleteUser = ({ id, name }: Props) => {
  const modal = useRef<HTMLDialogElement>(null);
  const toggleModal = () => {
    if (!modal.current) {
      return;
    }
    modal.current.hasAttribute("open")
      ? modal.current.close()
      : modal.current.showModal();
  };
  const router = useRouter();
  const { mutate: deleteUser, isLoading: deleting } =
    api.users.deleteUserById.useMutation({
      onSuccess: () => {
        toggleModal();
        router.refresh();
      },
    });
  return (
    <div className="flex items-center">
      <Icon className="w-6 fill-c4" icon="delete" onClick={toggleModal} />
      <Modal toggleModal={toggleModal} ref={modal}>
        <div className="flex flex-col gap-5 bg-c3 p-10">
          <p className="text-center">Ta bort användaren?</p>
          <p className="text-center">{name}</p>
          <div className="flex justify-evenly gap-2">
            <Button onClick={toggleModal}>Avbryt</Button>
            <Button
              disabled={deleting}
              callToAction
              onClick={() => deleteUser({ id })}
            >
              Ta bort
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteUser;
