"use client";
import toast from "react-hot-toast";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";

type Props = { id: string };

const AddToMenu = ({ id }: Props) => {
  const utils = api.useUtils();
  const { mutate: addToMenu, isLoading: addingToMenu } =
    api.menu.addRecipe.useMutation({
      onSuccess: () => {
        utils.menu.getAll.invalidate();
        toast.success("Recept tillagt!");
      },
      onError: (err) => {
        if (err.message === "Förbjuden cirkulär referens.") {
          toast.error(err.message);
        }
      },
    });
  return (
    <Button
      callToAction
      onClick={() => addToMenu({ id })}
      disabled={addingToMenu}
    >
      Lägg till meny
    </Button>
  );
};

export default AddToMenu;
