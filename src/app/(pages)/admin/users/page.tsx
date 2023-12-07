import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

const Users = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    return (
      <>
        <p>Det finns inget för dig här.</p>
      </>
    );
  }
  const users = await api.users.getAll.query();
  return (
    <div className="h-full bg-c1">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Recipes</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ email, _count: { recipe } }) => (
            <tr key={email}>
              <td>{email}</td>
              <td>{recipe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
