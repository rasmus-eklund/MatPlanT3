import { getServerAuthSession } from "~/server/auth";
import NavLinks from "./NavLinks";
import Image from "next/image";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";

const Header = () => {
  return (
    <header className="bg-c5 sticky top-0 z-10 flex w-full max-w-5xl items-center justify-between pr-2">
      <Link href="/">
        <Image
          className={"w-28 md:w-52"}
          priority={true}
          src={"/logo-color.svg"}
          alt="MatPlan logo"
          width={478}
          height={222}
        />
      </Link>
      <Suspense fallback={<HeaderContentFallback />}>
        <HeaderContent />
      </Suspense>
    </header>
  );
};

const HeaderContent = async () => {
  const user = await getServerAuthSession(true);

  return user ? (
    <NavLinks user={user} />
  ) : (
    <Button asChild>
      <LoginLink>Logga in</LoginLink>
    </Button>
  );
};

const HeaderContentFallback = () => (
  <Skeleton
    aria-hidden="true"
    className="h-10 w-24 md:w-40"
  />
);

export default Header;
