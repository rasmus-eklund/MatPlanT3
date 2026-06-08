import { WithAuth } from "~/components/common/withAuth";
import { formatRelativeActivity } from "~/lib/formatRelativeActivity";
import { getAllUsers } from "~/server/api/users";
import UsersList from "./_components/UsersList";

const page = async () => {
  const allUsers = await getAllUsers();
  const users = allUsers.map((user) => ({
    ...user,
    display: {
      createdAt: user.createdAt.toLocaleDateString("sv-SE"),
      lastActiveAt: formatRelativeActivity(user.lastActiveAt),
      lastAuditAt: formatRelativeActivity(user.lastAuditAt),
    },
  }));

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 p-5">
      <UsersList users={users} />
    </section>
  );
};

export default WithAuth(page, true, async () => "/admin/users");
