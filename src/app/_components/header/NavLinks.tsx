"use client";
import Link from "next/link";
import Icon from "~/icons/Icon";
import type { tIcon } from "types";
import { useSession } from "next-auth/react";

type Props = { className: string; icons?: string };
const NavLinks = ({ className: style, icons }: Props) => {
  const { data: session } = useSession();
  const items: { name: string; href: string; icon: tIcon }[] = [
    { name: "Meny", href: "/menu", icon: "home" },
    { name: "Maträtter", href: "/recipes/search", icon: "recipes" },
    { name: "Varor", href: "/items", icon: "pizza" },
    { name: "Inköpslista", href: "/shoppingList", icon: "cart" },
    { name: "Butik", href: "/stores", icon: "store" },
    { name: "Profil", href: "/user", icon: "user" },
  ];
  const className = {
    icon: `fill-c3 md:hover:scale-110 ${icons}`,
    title: "text-sm font-bold text-c2 md:text-base hidden md:block",
    parent: "flex flex-col items-center",
  };
  return (
    <ul className={style}>
      {items.map(({ name, href, icon }) => (
        <li key={name}>
          <Link className={className.parent} href={href} data-cy={icon}>
            <Icon className={className.icon} icon={icon} />
            <h3 className={className.title}>{name}</h3>
          </Link>
        </li>
      ))}
      {session && session.user.role === "ADMIN" && (
        <li>
          <Link prefetch={false} className={className.parent} href={"/admin"}>
            <Icon className={className.icon} icon="admin" />
            <h3 className={className.title}>Admin</h3>
          </Link>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
