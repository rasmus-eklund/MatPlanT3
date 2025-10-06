import Icon from "~/components/common/Icon";
import Link from "next/link";

const AdminHeader = () => {
  return (
    <header className="bg-c2 p-2">
      <ul className="flex justify-evenly">
        <li>
          <Link href="/admin/ingredients">
            <Icon icon="Pizza" className="w-8" />
          </Link>
        </li>
        <li>
          <Link href="/admin/users">
            <Icon icon="User" className="w-8" />
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default AdminHeader;
