"use client";

import Image from "next/image";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";

const Header = () => {
  const usePathName = usePathname();
  return (
    <>
      {usePathName !== "/" && (
        <>
          <header className="bg-c5 flex items-center justify-between">
            <Image
              className={"px-2"}
              src={"/logo-color.svg"}
              alt="MatPlan logo"
              width={150}
              height={80}
            />
            <div className="justify-items-end">
              <LoginButton />
            </div>
          </header>
          <Navbar />
        </>
      )}
    </>
  );
};

export default Header;
