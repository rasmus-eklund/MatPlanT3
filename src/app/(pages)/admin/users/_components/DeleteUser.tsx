import ServerFormSubmit from "~/components/common/ServerFormSubmit";
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
import { type User } from "~/server/auth";

type Props = { id: string; name: string; user: User };

const DeleteUser = ({ id, name, user }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Icon className="text-c4" icon="Trash" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ta bort användaren?</DialogTitle>
          <DialogDescription>
            Du kommer att ta bort användare {name}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex">
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
