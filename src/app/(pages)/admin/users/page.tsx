import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import User from "./_components/User";
import AdminHeader from "../_components/AdminHeader";

const Users = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    return <p>Det finns inget för dig här.</p>;
  }
  const users = await api.users.getAll.query();
  return (
    <div>
      <AdminHeader />
      <section className="flex flex-col gap-2 p-5">
        <h2 className="text-lg text-c2">Användare: {users.length}</h2>
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <User key={user.id} user={user} />
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Users;
