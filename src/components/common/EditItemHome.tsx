"use client";
import { useEffect, useState } from "react";
import Icon from "~/components/common/Icon";
import { cn, delay } from "~/lib/utils";
import { toast } from "sonner";
type Props = {
  home: boolean;
  onHome: (home: boolean) => Promise<void>;
};

const EditItemHome = ({ home, onHome }: Props) => {
  const [animate, setAnimate] = useState(home);

  useEffect(() => {
    setAnimate(home);
  }, [home]);

  const onClick = async () => {
    setAnimate((p) => !p);
    await delay(300);
    try {
      await onHome(home);
    } catch {
      setAnimate(home);
      toast.error("Något gick fel...");
    }
  };
  return (
    <Icon
      icon="Refrigerator"
      className={cn(
        "rounded-md transition-all duration-300",
        animate ? "fill-c4 hover:fill-c2" : "fill-c2 hover:fill-c4",
      )}
      onClick={onClick}
    />
  );
};

export default EditItemHome;
