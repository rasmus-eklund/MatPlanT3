import DeleteUser from "./DeleteUser";
import EditNameDialog from "~/components/common/EditNameDialog";

type Props = { name: string | null; id: string };
const Settings = ({ name, id }: Props) => {
  return (
    <div className="flex flex-col gap-2 bg-c2 p-5">
      <p>Användarnamn: {name ?? "Inget namn"}</p>
      <EditNameDialog
        name={name ?? "Inget namn"}
        info={{ title: "användarnamn", description: "Byt ditt användarnamn." }}
      />
      <DeleteUser id={id} />
    </div>
  );
};

export default Settings;
