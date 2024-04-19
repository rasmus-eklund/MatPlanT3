"use client";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { errorMessages } from "~/server/errors";

const Error = ({ error }: { error: Error }) => {
  console.log(error.message);
  if (error.message === errorMessages.UNAUTHORIZED) {
    return (
      <section className="flex h-1/3 flex-col items-center justify-center">
        <h1 className="text-xl">Du är inte inloggad.</h1>
        <LoginLink className="underline">Logga in</LoginLink>
      </section>
    );
  }
};

export default Error;
