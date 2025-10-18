import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import User from "./_components/User";
import { getAllUsers } from "~/server/api/users";

const page = async ({ user }: WithAuthProps) => {
  const allUsers = await getAllUsers();
  return (
    <section className="flex flex-col gap-2 p-5">
      <h2 className="text-c2 text-lg">Användare: {allUsers.length}</h2>
      <ul className="flex flex-col gap-2">
        {allUsers.map((userData) => (
          <User key={userData.id} userData={userData} user={user} />
        ))}
      </ul>
    </section>
  );
};

export default WithAuth(page, true);
