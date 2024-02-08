"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import { tName, zName } from "~/zod/zodSchemas";

type Props = { toggleModal: () => void };

const RenameUser = ({ toggleModal }: Props) => {
  const router = useRouter();
  const { mutate: renameUser, isLoading: renaming } =
    api.users.editUserName.useMutation({
      onSuccess: () => {
        toggleModal();
        router.refresh();
        toast("Användarnamn ändrat!");
      },
    });
  const { register, handleSubmit } = useForm<tName>({
    resolver: zodResolver(zName),
  });
  return (
    <form
      onSubmit={handleSubmit(({ name }) => renameUser({ name }))}
      className="flex flex-col gap-4 border border-c5 p-5"
    >
      <label>Namn</label>
      <input {...register("name")} className="text-center text-c5" />
      <div className="flex justify-evenly">
        <Button type="button" onClick={toggleModal}>
          Avbryt
        </Button>
        <Button type="submit" callToAction disabled={renaming}>
          Spara
        </Button>
      </div>
    </form>
  );
};

export default RenameUser;
