import UpdateMeilisearchButton from "./_components/UpdateMeilisearchButton";
import { getServerAuthSession } from "~/server/auth";
import { getUserCount } from "~/server/api/admin";

const Admin = async () => {
  const user = await getServerAuthSession();
  if (!user?.admin) {
    return <p>Det finns inget för dig här.</p>;
  }
  const nrUsers = await getUserCount();
  return (
    <div className="flex flex-col gap-5 p-5">
      <p>Antal användare: {nrUsers}</p>
      <UpdateMeilisearchButton />
    </div>
  );
};

export default Admin;
