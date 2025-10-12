"use client";

import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import Icon, { type IconName } from "./Icon";
import { Spinner } from "../ui/spinner";

type Props = { children?: ReactNode; icon?: IconName | null };

const ServerFormSubmit = ({ children, icon }: Props) => {
  const { pending } = useFormStatus();
  if (pending) {
    return icon ? (
      <Spinner className="mx-2.5" />
    ) : (
      <Button type="button" disabled>
        <Spinner className="mr-2" />
        Vänta
      </Button>
    );
  }
  return (
    <Button
      variant={icon ? "ghost" : "default"}
      size={icon && "icon"}
      type="submit"
      disabled={pending}
    >
      {icon ? <Icon className="text-c5" icon={icon} /> : children}
    </Button>
  );
};

export default ServerFormSubmit;
