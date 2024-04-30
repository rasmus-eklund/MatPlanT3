import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { addToMenu } from "~/server/api/menu";

type Props = { id: string };

const AddToMenu = ({ id }: Props) => {
  return (
    <form
      action={async () => {
        "use server";
        await addToMenu(id);
      }}
    >
      <ServerFormSubmit>Lägg till meny</ServerFormSubmit>
    </form>
  );
};

export default AddToMenu;
