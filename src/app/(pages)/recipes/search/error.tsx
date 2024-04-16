"use client";

import { useRouter } from "next/navigation";

const Error = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 bg-c3 p-5">
      <h2 className="text-3xl text-c5">Något gick fel...</h2>
      <button
        className="w-fit rounded-md border-c3 bg-c4 px-4 py-2 underline"
        onClick={() => router.push("/recipes/search")}
      >
        Försök igen.
      </button>
    </div>
  );
};

export default Error;
