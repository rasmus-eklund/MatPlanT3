import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { copyRecipe } from "~/server/api/recipes";
import { type User } from "~/server/auth";

type Props = { id: string; user: User; name: string };

const CopyRecipe = ({ id, user, name }: Props) => {
  return (
    <form
      action={async () => {
        "use server";
        await copyRecipe({ id, user, name });
      }}
    >
      <ServerFormSubmit>Kopiera recept</ServerFormSubmit>
    </form>
  );
};

export default CopyRecipe;
