import {
  UpdateMeiliIngredients,
  UpdateMeiliRecipes,
} from "./_components/UpdateMeilisearchButtons";
import { getUserCount } from "~/server/api/admin";

const page = async () => {
  const nrUsers = await getUserCount();
  return (
    <div className="flex flex-col gap-5 p-5">
      <p>Antal användare: {nrUsers}</p>
      <UpdateMeiliRecipes />
      <UpdateMeiliIngredients />
    </div>
  );
};

export default page;
