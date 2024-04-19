import User from "./_components/User";
import { getAllUsers } from "~/server/api/users";

const Users = async () => {
  const allUsers = await getAllUsers();
  return (
    <section className="flex flex-col gap-2 p-5">
      <h2 className="text-c2 text-lg">Användare: {allUsers.length}</h2>
      <ul className="flex flex-col gap-2">
        {allUsers.map((user) => (
          <User key={user.id} user={user} />
        ))}
      </ul>
    </section>
  );
};

export default Users;
