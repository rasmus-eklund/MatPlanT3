"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

const LoginButton = () => {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <div className="flex flex-row font-semibold">
          <button
            className="text-c2"
            onClick={async () => await signOut({ callbackUrl: "/" })}
            type="button"
          >
            Logga ut
          </button>
          {session.user.image && (
            <Image
              className="h-10 w-10 rounded-full"
              src={session.user.image}
              alt="user image"
              width={96}
              height={96}
            />
          )}
        </div>
      ) : (
        <button
          className="text-c2 mr-4 text-center"
          onClick={async () => {
            await signIn("google", { callbackUrl: "/home" });
          }}
          type="button"
        >
          Logga in
        </button>
      )}
    </>
  );
};

export default LoginButton;
