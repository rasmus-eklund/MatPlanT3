"use client";
import { useFormStatus } from "react-dom";
import { Button } from "~/components/ui/button";
import Icon from "~/components/common/Icon";
import { Spinner } from "../ui/spinner";

type Props = { icon?: boolean };
const DeleteButton = ({ icon = true }: Props) => {
  const { pending } = useFormStatus();
  if (pending) {
    return <Spinner />;
  } else {
    return icon ? (
      <button>
        <Icon icon="Trash" className="hover:text-red-600" />
      </button>
    ) : (
      <Button variant="destructive">Ta bort</Button>
    );
  }
};

export default DeleteButton;
