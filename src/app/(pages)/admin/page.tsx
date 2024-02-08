import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import UpdateMeilisearchButton from "./_components/UpdateMeilisearchButton";
import AdminHeader from "./_components/AdminHeader";

const Admin = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    return <p>Det finns inget för dig här.</p>;
  }
  const nrUsers = await api.users.getCount.query();
  return (
    <div className="bg-c3">
      <AdminHeader />
      <div className="flex flex-col gap-5 p-5">
        <p>Antal användare: {nrUsers}</p>
        <UpdateMeilisearchButton />
      </div>
    </div>
  );
};

export default Admin;
