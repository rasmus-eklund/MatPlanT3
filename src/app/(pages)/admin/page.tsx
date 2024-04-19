import UpdateMeilisearchButton from "./_components/UpdateMeilisearchButton";
import { getUserCount } from "~/server/api/admin";

const Admin = async () => {
  const nrUsers = await getUserCount();
  return (
    <div className="flex flex-col gap-5 p-5">
      <p>Antal användare: {nrUsers}</p>
      <UpdateMeilisearchButton />
    </div>
  );
};

export default Admin;
