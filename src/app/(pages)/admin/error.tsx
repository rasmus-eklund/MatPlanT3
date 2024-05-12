"use client";
import { errorMessages } from "~/server/errors";

const Error = ({ error }: { error: Error }) => {
  if (error.message === errorMessages.UNAUTHORIZED) {
    return (
      <section className="flex h-1/3 flex-col items-center justify-center">
        <h1 className="text-xl">Det finns inget här för dig.</h1>
      </section>
    );
  }
};

export default Error;
