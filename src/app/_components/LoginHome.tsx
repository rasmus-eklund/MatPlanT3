"use client";
import { signIn } from "next-auth/react";

const Login = () => {
  return (
    <button
      className="cursor-pointer rounded-md bg-c5/80 p-2 px-6 text-3xl text-c2 md:hover:bg-c4"
      onClick={async () => {
        await signIn("google", { callbackUrl: "/menu" });
      }}
    >
      Logga in
    </button>
  );
};

export default Login;
