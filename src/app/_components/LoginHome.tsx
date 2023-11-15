"use client";
import { signIn } from "next-auth/react";

const Login = () => {
  return (
    <button
      className="text-c2 bg-c5/80 md:hover:bg-c4 rounded-md p-2 px-6 text-3xl cursor-pointer"
      onClick={async () => {
        await signIn("google", { callbackUrl: "/menu" });
      }}
    >
      Logga in
    </button>
  );
};

export default Login;
