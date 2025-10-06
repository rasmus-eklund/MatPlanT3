"use client";
import { useState } from "react";
import Icon from "~/components/common/Icon";
import { cn, delay } from "~/lib/utils";
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
      icon="Refrigerator"
      className={cn(
        "bg-c3 rounded-md transition-all duration-300",
        animate ? "md:hover:text-c2" : "text-c2 md:hover:text-c5",
      )}
      onClick={onClick}
    />
  );
};

export default EditItemHome;
