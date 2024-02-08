"use client";
import { signOut } from "next-auth/react";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";

type Props = { toggleModal: () => void };

const DeleteUser = ({ toggleModal }: Props) => {
  const { mutate: deleteUser, isLoading: deleting } =
    api.users.deleteUser.useMutation({
      onSuccess: async () => await signOut({ callbackUrl: "/" }),
    });
  return (
    <div className="flex flex-col gap-4 border border-c5 p-5">
      <p className="text-center text-c5">
        Ta bort din användare, alla dina recept och affärer?
      </p>
      <div className="flex justify-evenly">
        <Button onClick={toggleModal}>Avbryt</Button>
        <Button callToAction disabled={deleting} onClick={() => deleteUser()}>
          Ta bort
        </Button>
      </div>
    </div>
  );
};

export default DeleteUser;
