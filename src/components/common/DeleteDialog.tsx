import { type ReactNode } from "react";

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

type Props = { children: ReactNode; info: { title: string } };
const DeleteDialog = ({ children, info: { title } }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Ta bort</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ta bort {title.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Detta kommer att ta bort {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between md:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          {children}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
