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
import { deleteUserById } from "~/server/api/users";
import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { type User } from "~/server/auth";

type Props = { id: string; user: User };

const DeleteUser = ({ id, user }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Ta bort ditt konto</Button>
      </DialogTrigger>
      <DialogContent className="bg-c2">
        <DialogHeader>
          <DialogTitle>Ta bort din användare</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Detta kommer permanent ta bort din användare och all din data.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <form
            action={async () => {
              "use server";
              await deleteUserById({ id, user });
            }}
          >
            <ServerFormSubmit>Ta bort</ServerFormSubmit>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUser;
