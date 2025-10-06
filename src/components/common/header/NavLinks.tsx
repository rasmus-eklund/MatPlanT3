"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon, { type IconName } from "~/components/common/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { UserSession } from "~/server/shared";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { cn } from "~/lib/utils";

type MenuItem = {
  name: string;
  href: string;
  icon: IconName;
  active?: boolean;
};

type Props = { user: UserSession | null };
const NavLinks = ({ user }: Props) => {
  const pathname = usePathname();
  const items: MenuItem[] = [
    {
      name: "Meny",
      href: "/menu",
      icon: "MenuSquare",
      active: pathname.startsWith("/menu"),
    },
    {
      name: "Maträtter",
      href: "/recipes",
      icon: "Utensils",
      active: pathname.startsWith("/recipes"),
    },
    {
      name: "Inköpslista",
      href: "/items",
      icon: "ShoppingCart",
      active: pathname.startsWith("/items"),
    },
    {
      name: "Butik",
      href: "/stores",
      icon: "Store",
      active: pathname.startsWith("/stores"),
    },
  ];
  const menuItems: MenuItem[] = [
    { name: "Profil", href: "/user", icon: "User" },
  ];
  const className = {
    icon: "text-c3 size-10 md:size-12",
    title: "text-sm font-bold text-c2 md:text-base hidden md:block",
    parent: "flex flex-col items-center justify-between",
    menuIcon: "text-c3",
  };
  return (
    <nav className="flex grow justify-between gap-4">
      <ul className="flex grow items-center justify-evenly px-4">
        {items.map(({ name, href, icon, active }) => (
          <li key={name + " nav"}>
            <Link className={className.parent} href={href} data-cy={icon}>
              <Icon
                className={cn(className.icon, active && "text-c1")}
                icon={icon}
              />
              <h3 className={className.title}>{name}</h3>
            </Link>
          </li>
        ))}
      </ul>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Icon icon="Menu" className={className.icon} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            {user?.given_name ?? "Ditt"} konto
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menuItems.map(({ href, icon, name }) => (
            <DropdownMenuItem asChild key={name + " menu"}>
              <Link href={href} className="flex gap-4">
                <Icon className={className.menuIcon} icon={icon} />
                <span>{name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          {user?.admin && (
            <DropdownMenuItem asChild>
              <Link className="flex gap-4" href={"/admin"}>
                <Icon className={className.menuIcon} icon="UserCog" />
                <span>Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <LogoutLink className="flex cursor-default gap-4">
              <Icon icon="LogOut" className={className.menuIcon} />
              <span>Logga ut</span>
            </LogoutLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default NavLinks;
