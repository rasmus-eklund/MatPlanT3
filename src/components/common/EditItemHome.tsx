"use client";
import { useState } from "react";
import Icon from "~/icons/Icon";
import { delay } from "~/lib/utils";
type Props = {
  home: boolean;
  onHome: (home: boolean) => Promise<void>;
};

const EditItemHome = ({ home, onHome }: Props) => {
  const [animate, setAnimate] = useState(home);
  const onClick = async () => {
    setAnimate((p) => !p);
    await delay(300);
    await onHome(home);
  };
  return (
    <Icon
      icon="home"
      className={`h-6 w-6 cursor-pointer rounded-md bg-c3 transition-all duration-300 ${
        animate ? "fill-c5 md:hover:fill-c2" : "fill-c2 md:hover:fill-c5"
      }`}
      onClick={onClick}
    />
  );
};

export default EditItemHome;
