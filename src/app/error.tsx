"use client";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { errorMessages } from "~/server/errors";

const Error = ({ error }: { error: Error }) => {
  if (error.message === errorMessages.UNAUTHORIZED) {
    return (
      <section className="flex h-1/3 flex-col items-center justify-center">
        <h1 className="text-xl">Du är inte inloggad.</h1>
        <LoginLink className="underline">Logga in</LoginLink>
      </section>
    );
  }
  if (error.message === errorMessages.CIRCULARREF) {
    return (
      <section className="flex h-1/3 flex-col items-center justify-center">
        <h1 className="text-xl">
          Det är inte tillåtet att skapa cirkulära referenser.
        </h1>
        <p>
          Du har lagt till ett recept till ett annat recept där samma recept
          förekommer.
        </p>
      </section>
    );
  }
};

export default Error;
