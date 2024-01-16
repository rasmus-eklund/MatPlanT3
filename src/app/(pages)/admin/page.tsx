import Link from "next/link";
import Icon from "~/icons/Icon";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import UpdateMeilisearchButton from "./_components/UpdateMeilisearchButton";

const Admin = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    return (
      <>
        <p>Det finns inget för dig här.</p>
      </>
    );
  }
  const nrUsers = await api.users.getCount.query();
  return (
    <div className="h-full bg-c1">
      <header className="bg-c2">
        <ul className="flex">
          <li>
            <Link href="/admin/ingredients">
              <Icon icon="pizza" className="w-10 fill-c5" />
            </Link>
          </li>
          <li>
            <Link href="/admin/users">
              <Icon icon="admin" className="w-10 fill-c5" />
            </Link>
          </li>
        </ul>
      </header>
      <p>Users: {nrUsers}</p>
      <UpdateMeilisearchButton />
    </div>
  );
};

export default Admin;
