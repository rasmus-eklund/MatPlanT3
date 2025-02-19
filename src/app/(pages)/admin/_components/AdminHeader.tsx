import Icon from "~/icons/Icon";
import Link from "next/link";

const AdminHeader = () => {
  return (
    <header className="bg-c2 p-2">
      <ul className="flex justify-evenly">
        <li>
          <Link href="/admin/ingredients">
            <Icon icon="pizza" className="w-8" />
          </Link>
        </li>
        <li>
          <Link href="/admin/users">
            <Icon icon="admin" className="w-8" />
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default AdminHeader;
