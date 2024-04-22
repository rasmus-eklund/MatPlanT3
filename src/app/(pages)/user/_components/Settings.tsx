import { toast } from "sonner";
import DeleteUser from "./DeleteUser";
import EditNameDialog from "~/components/common/EditNameDialog";
import { renameUser } from "~/server/api/users";
import type { tName } from "~/zod/zodSchemas";

type Props = { name: string | null; id: string };
const Settings = ({ name, id }: Props) => {
  const onSubmit = async ({ name }: tName) => {
    "use server";
    await renameUser(name);
    toast.success("Användarnamn bytt!");
  };
  return (
    <div className="flex flex-col gap-2 bg-c2 p-5">
      <p>Användarnamn: {name ?? "Inget namn"}</p>
      <EditNameDialog
        name={name ?? "Inget namn"}
        info={{ title: "användarnamn", description: "Byt ditt användarnamn." }}
        onSubmit={onSubmit}
      />
      <DeleteUser id={id} />
    </div>
  );
};

export default Settings;
