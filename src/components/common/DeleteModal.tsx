import Icon from "~/icons/Icon";
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
import ServerFormSubmit from "./ServerFormSubmit";

type Props = {
  info: {
    name: string;
    description: string;
  };
  icon: boolean;
  action: () => Promise<void>;
};

const RemoveItemDialog = ({ icon = true, info, action }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {icon ? (
          <Icon icon="delete" className="size-6 fill-c5" />
        ) : (
          <Button variant="destructive">Ta bort</Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-c2">
        <DialogHeader>
          <DialogTitle>Ta bort {info.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{info.description}</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <form action={action}>
            <ServerFormSubmit>Ta bort</ServerFormSubmit>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveItemDialog;
