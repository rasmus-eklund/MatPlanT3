import Link from "next/link";
import Icon from "../icons/Icon";
import type { tIcon } from "types";
import { UserRole } from "@prisma/client";

type Props = { role: UserRole };
const Navbar = async ({ role }: Props) => {
  const items: { name: string; href: string; icon: tIcon }[] = [
    { name: "Meny", href: "/menu", icon: "home" },
    { name: "Maträtter", href: "/recipes/search", icon: "recipes" },
    { name: "Varor", href: "/items", icon: "pizza" },
    { name: "Inköpslista", href: "/shoppingList", icon: "cart" },
    { name: "Butik", href: "/stores", icon: "store" },
  ];

  return (
    <nav className="bg-c5 grow">
      <ul className="flex justify-evenly px-4 py-4">
        {items.map(({ name, href, icon }) => (
          <li key={name}>
            <Link className="flex flex-col items-center" href={href}>
              <Icon
                className="h-10 w-10 fill-c3 hover:scale-110 md:h-12"
                icon={icon}
              />
              <h3 className="text-sm font-bold text-c2 md:text-base">{name}</h3>
            </Link>
          </li>
        ))}
        {role === "ADMIN" && (
          <li>
            <Link className="flex flex-col items-center" href={"/admin"}>
              <Icon
                className="h-10 w-10 fill-c3 hover:scale-110 md:h-12"
                icon="admin"
              />
              <h3 className="text-sm font-bold text-c2 md:text-base">Admin</h3>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
