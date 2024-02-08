"use client";
import { signOut } from "next-auth/react";

const LogOut = () => {
  return (
    <button
      className="text-lg underline"
      onClick={async () => await signOut({ callbackUrl: "/" })}
    >
      Logga ut
    </button>
  );
};

export default LogOut;
