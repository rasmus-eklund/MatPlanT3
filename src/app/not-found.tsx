"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex h-full flex-col items-center p-4 gap-10">
      <h1 className="text-c5 pt-20 text-4xl">Sidan finns inte</h1>
      <Button asChild>
        <Link href="/menu" className="text-c1 text-lg">
          Tillbaka till Meny
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
