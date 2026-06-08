import { WithAuth } from "~/components/common/withAuth";
import { getAllUsers } from "~/server/api/users";
import UsersList from "./_components/UsersList";

const page = async () => {
  const allUsers = await getAllUsers();

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 p-5">
      <UsersList users={allUsers} />
    </section>
  );
};

export default WithAuth(page, true, async () => "/admin/users");
