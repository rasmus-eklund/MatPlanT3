"use client";

import { useRef, useState } from "react";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import DeleteUser from "./Modals/DeleteUser";
import RenameUser from "./Modals/RenameUser";

const Settings = () => {
  const modal = useRef<HTMLDialogElement>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const toggleModal = () => {
    if (!modal.current) {
      return;
    }
    modal.current.hasAttribute("open")
      ? modal.current.close()
      : modal.current.showModal();
  };

  return (
    <div className="flex flex-col gap-2 p-5">
      <Button
        onClick={() => {
          setModalContent(<RenameUser toggleModal={toggleModal} />);
          toggleModal();
        }}
      >
        Byt användarnamn
      </Button>
      <Button
        onClick={() => {
          setModalContent(<DeleteUser toggleModal={toggleModal} />);
          toggleModal();
        }}
      >
        Ta bort konto
      </Button>
      <Modal toggleModal={toggleModal} ref={modal}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Settings;
