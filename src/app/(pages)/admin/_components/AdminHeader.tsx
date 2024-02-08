import Link from "next/link";
import Icon from "~/icons/Icon";

const AdminHeader = () => {
  return (
    <header className="bg-c2 p-2">
      <ul className="flex justify-evenly">
        <li>
          <Link href="/admin/ingredients">
            <Icon icon="pizza" className="w-8 fill-c5" />
          </Link>
        </li>
        <li>
          <Link href="/admin/users">
            <Icon icon="admin" className="w-8 fill-c5" />
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default AdminHeader;
