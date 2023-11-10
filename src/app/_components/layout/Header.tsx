import Image from "next/image";
import Navbar from "./Navbar";
import { getServerAuthSession } from "~/server/auth";
import LogOutButton from "./LogoutButton";

const Header = async () => {
  const session = await getServerAuthSession();
  return (
    <header className="flex items-center justify-between bg-c5 px-5">
      <Image
        className={""}
        src={"/logo-color.svg"}
        alt="MatPlan logo"
        width={150}
        height={80}
      />
      {session && <Navbar role={session.user.role} />}
      <LogOutButton />
    </header>
  );
};

export default Header;
