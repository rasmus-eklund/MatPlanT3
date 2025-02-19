"use client";
import { useFormStatus } from "react-dom";
import { ClipLoader } from "react-spinners";
import { Button } from "~/components/ui/button";
import Icon from "~/icons/Icon";

type Props = { icon?: boolean };
const DeleteButton = ({ icon = true }: Props) => {
  const { pending } = useFormStatus();
  if (pending) {
    return <ClipLoader size={18} />;
  } else {
    if (icon) {
      return (
        <button>
          <Icon
            icon="delete"
            className="size-5 fill-black hover:fill-red-600"
          />
        </button>
      );
    }
    return <Button variant={"destructive"}>Ta bort</Button>;
  }
};

export default DeleteButton;
