import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { copyRecipe } from "~/server/api/recipes";

type Props = { id: string };

const CopyRecipe = ({ id }: Props) => {
  return (
    <form
      action={async () => {
        "use server";
        await copyRecipe(id);
      }}
    >
      <ServerFormSubmit>Kopiera recept</ServerFormSubmit>
    </form>
  );
};

export default CopyRecipe;
