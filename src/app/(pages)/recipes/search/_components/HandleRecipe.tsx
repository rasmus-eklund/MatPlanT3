"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import AddToMenu from "./addToMenu";
import Modal from "~/app/_components/Modal";
import { useRef } from "react";

type Props = { id: string; yours: boolean };

const HandleRecipe = ({ id, yours }: Props) => {
  const modal = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { mutate: remove, isLoading: removingRecipe } =
    api.recipe.remove.useMutation({
      onSuccess: () => {
        router.push("/recipes/search");
        router.refresh();
      },
      onError: () => {
        toast.error("Kunde inte ta bort recept.");
      },
    });

  const { mutate: copy, isLoading: copying } = api.recipe.copy.useMutation({
    onSuccess: ({ id }) => {
      router.push(`/recipes/search/${id}`);
      router.refresh();
      toast.success("Recept kopierat!");
    },
  });

  const toggleModal = () => {
    if (!modal.current) {
      return;
    }
    modal.current.hasAttribute("open")
      ? modal.current.close()
      : modal.current.showModal();
  };
  if (yours) {
    return (
      <div className="flex h-10 items-center justify-between p-2">
        <AddToMenu id={id} />
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/recipes/edit/${id}`)}>
            Ändra
          </Button>
          <Button disabled={removingRecipe} onClick={toggleModal}>
            Ta bort
          </Button>
        </div>
        <Modal toggleModal={toggleModal} ref={modal}>
          <div className="flex flex-col gap-4 border border-c5 p-5">
            <p className="text-center text-c5">Ta bort recept?</p>
            <div className="flex gap-5">
              <Button onClick={toggleModal}>Avbryt</Button>
              <Button
                callToAction
                disabled={removingRecipe}
                onClick={() => remove({ id })}
              >
                Ta bort
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
  return (
    <div className="flex h-10 items-center justify-between p-2">
      <Button onClick={() => router.back()}>Tillbaka</Button>
      <Button callToAction disabled={copying} onClick={() => copy({ id })}>
        Spara kopia till dina recept
      </Button>
    </div>
  );
};

export default HandleRecipe;
