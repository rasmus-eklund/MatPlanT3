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

type Props = { id: string };

const DeleteUser = ({ id }: Props) => {
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
              await deleteUserById(id);
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
