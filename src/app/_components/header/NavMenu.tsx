"use client";
import { useState } from "react";
import NavLinks from "./NavLinks";
import Image from "next/image";

const NavMenu = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const className = {
    line: "h-1 w-7 my-1 rounded-full bg-c3 transition ease transform duration-300",
    icon: `transition-all duration-500 ease-in-out h-8 ${
      open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
    }`,
  };
  return (
    <header className="z-10 sticky top-0 flex flex-col items-center justify-between bg-c5 pl-1 pr-2 md:hidden">
      <div className="flex w-full items-center justify-between">
        <Image
          className={"w-28"}
          priority={true}
          src={"/logo-color.svg"}
          alt="MatPlan logo"
          width={478}
          height={222}
        />
        <button
          className="group flex h-10 w-10 flex-col items-center justify-center"
          onClick={() => {
            if (open) {
              setOpen((p) => {
                setTimeout(() => {
                  setVisible(!p);
                }, 500);
                return !p;
              });
            } else {
              setVisible((p) => {
                setTimeout(() => {
                  setOpen(!p);
                }, 0);
                return !p;
              });
            }
          }}
        >
          <div
            className={`${className.line} ${
              open
                ? "translate-y-3 rotate-45 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${className.line} ${
              open ? "opacity-0" : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${className.line} ${
              open
                ? "-translate-y-3 -rotate-45 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
      <nav
        className={`w-full transition-[height] duration-500 ease-in-out ${
          open ? "h-12" : "h-0"
        }`}
      >
        <NavLinks
          className={`justify-between p-2 ${visible ? "flex" : "hidden"}`}
          icons={className.icon}
        />
      </nav>
    </header>
  );
};

export default NavMenu;
