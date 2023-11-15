"use client";
import { signOut } from "next-auth/react";
import Icon from "~/icons/Icon";

type Props = { icon: string; title: string; parent: string };
const LogOutButton = ({ icon, parent, title }: Props) => {
  return (
    <div className={parent}>
      <button onClick={async () => await signOut({ callbackUrl: "/" })}>
        <Icon icon="logout" className={icon} />
      </button>
      <p className={title}>LogOut</p>
    </div>
  );
};

export default LogOutButton;
