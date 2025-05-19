import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { addToMenu } from "~/server/api/menu";
import { type User } from "~/server/auth";

type Props = { id: string; user: User };

const AddToMenu = (props: Props) => {
  return (
    <form
      action={async () => {
        "use server";
        await addToMenu(props);
      }}
    >
      <ServerFormSubmit>Lägg till meny</ServerFormSubmit>
    </form>
  );
};

export default AddToMenu;
