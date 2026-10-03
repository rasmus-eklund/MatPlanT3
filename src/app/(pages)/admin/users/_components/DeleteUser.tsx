"use client";
import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Icon from "~/components/common/Icon";
import { deleteUserById } from "~/server/api/users";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

type Props = { id: string; name: string };

const DeleteUser = ({ id, name }: Props) => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      await deleteUserById({ id });
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      toast.error("Något gick fel...");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <Icon icon="Trash" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ta bort användaren?</DialogTitle>
          <DialogDescription>Du kommer att ta bort användare {name}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Avbryt
              </Button>
            }
          />
          <Button onClick={handleDeleteUser} disabled={deleting}>
            Ta bort
            {deleting ? <Spinner /> : <Icon icon="Trash" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUser;
