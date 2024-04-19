import DeleteUser from "./DeleteUser";
import RenameUser from "./RenameUser";

type Props = { name: string | null; id: string };
const Settings = ({ name, id }: Props) => {
  return (
    <div className="bg-c2 flex flex-col gap-2 p-5">
      <p>Användarnamn: {name ?? "Inget namn"}</p>
      <RenameUser name={name ?? "Inget namn"} />
      <DeleteUser id={id} />
    </div>
  );
};

export default Settings;
