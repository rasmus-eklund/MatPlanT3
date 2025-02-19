"use client";
import Link from "next/link";
import Icon from "~/icons/Icon";
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

type Props = { user: UserSession | null };
const NavLinks = ({ user }: Props) => {
  const items = [
    { name: "Meny", href: "/menu", icon: "home" },
    { name: "Maträtter", href: "/recipes", icon: "recipes" },
    { name: "Inköpslista", href: "/items", icon: "cart" },
    { name: "Butik", href: "/stores", icon: "store" },
  ] as const;
  const menuItems = [{ name: "Profil", href: "/user", icon: "user" }] as const;
  const className = {
    icon: "fill-c3 size-10 md:size-12",
    title: "text-sm font-bold text-c2 md:text-base hidden md:block",
    parent: "flex flex-col items-center justify-between",
    menuIcon: "fill-c3",
  };
  return (
    <nav className="flex grow justify-between gap-4">
      <ul className="flex grow items-center justify-evenly px-4">
        {items.map(({ name, href, icon }) => (
          <li key={name + " nav"}>
            <Link className={className.parent} href={href} data-cy={icon}>
              <Icon className={className.icon} icon={icon} />
              <h3 className={className.title}>{name}</h3>
            </Link>
          </li>
        ))}
      </ul>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Icon icon="hamburgerMenu" className={className.icon} />
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
                <Icon className={className.menuIcon} icon="admin" />
                <span>Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <LogoutLink className="flex cursor-default gap-4">
              <Icon icon="logout" className={className.menuIcon} />
              <span>Logga ut</span>
            </LogoutLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default NavLinks;
