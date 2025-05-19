import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { copyRecipe } from "~/server/api/recipes";
import { type User } from "~/server/auth";

type Props = { id: string; user: User };

const CopyRecipe = ({ id, user }: Props) => {
  return (
    <form
      action={async () => {
        "use server";
        await copyRecipe({ id, user });
      }}
    >
      <ServerFormSubmit>Kopiera recept</ServerFormSubmit>
    </form>
  );
};

export default CopyRecipe;
