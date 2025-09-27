"use client";

import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { ClipLoader } from "react-spinners";
import Icon, { type tIcon } from "~/icons/Icon";

type Props = { children?: ReactNode; icon?: tIcon | null };

const ServerFormSubmit = ({ children, icon }: Props) => {
  const { pending } = useFormStatus();
  if (pending) {
    return icon ? (
      <ClipLoader size={20} />
    ) : (
      <Button type="button" disabled>
        <ClipLoader size={20} className="mr-2" />
        Vänta
      </Button>
    );
  }
  return (
    <Button
      variant={icon ? "ghost" : "destructive"}
      size={icon && "icon"}
      type="submit"
      disabled={pending}
    >
      {icon ? <Icon className="fill-c5" icon={icon} /> : children}
    </Button>
  );
};

export default ServerFormSubmit;
