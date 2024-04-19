import { getServerAuthSession } from "~/server/auth";
import NavLinks from "./NavLinks";
import Image from "next/image";

const Header = async () => {
  const user = await getServerAuthSession();
  return (
    <header className="bg-c5 sticky top-0 z-10 flex w-full max-w-5xl items-center justify-between pr-2">
      <Image
        className={"w-28 md:w-52"}
        priority={true}
        src={"/logo-color.svg"}
        alt="MatPlan logo"
        width={478}
        height={222}
      />
      <NavLinks user={user} />
    </header>
  );
};

export default Header;
