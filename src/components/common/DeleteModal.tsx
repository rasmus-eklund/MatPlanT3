"use client";

import Icon from "~/components/common/Icon";
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
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  info: {
    name: string;
    description: string;
  };
  icon: boolean;
  action: () => Promise<void>;
  className?: string;
};

const RemoveItemDialog = ({ icon = true, info, action, className }: Props) => {
  const [deleting, setDeleting] = useState(false);
  const onDelete = async () => {
    setDeleting(true);
    try {
      await action();
    } catch (e) {
      console.error(e);
      toast.error("Något gick fel...");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger className={className} asChild>
        {icon ? (
          <Icon icon="Trash" />
        ) : (
          <Button variant="destructive">Ta bort</Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-c2">
        <DialogHeader>
          <DialogTitle>Ta bort {info.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{info.description}</DialogDescription>
        <DialogFooter className="flex-row justify-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <Button disabled={deleting} onClick={onDelete}>
            Ta bort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveItemDialog;
