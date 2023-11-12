import Image from "next/image";
import NavLinks from "./NavLinks";
import NavMenu from "./NavMenu";

const Header = async () => {
  return (
    <>
      <header className="sticky top-0 hidden items-center justify-between bg-c5 pr-2 md:flex">
        <Image
          className={"w-52"}
          priority={true}
          src={"/logo-color.svg"}
          alt="MatPlan logo"
          width={478}
          height={222}
        />
        <nav className="grow px-5">
          <NavLinks className="flex justify-evenly" icons="h-10" />
        </nav>
      </header>
      <NavMenu />
    </>
  );
};

export default Header;
