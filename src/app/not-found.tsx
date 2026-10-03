"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex h-full flex-col items-center gap-10 p-4">
      <h1 className="pt-20 text-4xl text-c5">Sidan finns inte</h1>
      <Button
        nativeButton={false}
        render={
          <Link href="/menu" className="text-lg text-c1">
            Tillbaka till Meny
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
