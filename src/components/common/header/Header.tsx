import { getServerAuthSession } from "~/server/auth";
import NavLinks from "./NavLinks";
import Image from "next/image";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "~/components/ui/button";
import Link from "next/link";

const Header = async () => {
  const user = await getServerAuthSession(true);
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
      {user ? (
        <NavLinks user={user} />
      ) : (
        <Button asChild>
          <LoginLink>Logga in</LoginLink>
        </Button>
      )}
    </header>
  );
};

export default Header;
