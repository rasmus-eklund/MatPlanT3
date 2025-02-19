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
import Icon from "~/icons/Icon";
import { deleteUserById } from "~/server/api/users";

type Props = { id: string; name: string };

const DeleteUser = ({ id, name }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Icon className="fill-c4" icon="delete" />
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
