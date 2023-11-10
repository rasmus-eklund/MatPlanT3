"use client";

import { signOut } from "next-auth/react";
import Icon from "../icons/Icon";

const LogOutButton = () => {
  return (
    <div className="flex flex-col">
      <button onClick={async () => await signOut({ callbackUrl: "/" })}>
        <Icon icon="logout" className="h-10 w-10 fill-c3" />
      </button>
      <p className="text-sm text-c3">LogOut</p>
    </div>
  );
};

export default LogOutButton;
