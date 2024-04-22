"use client";

import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { ClipLoader } from "react-spinners";
import Icon, { type tIcon } from "~/icons/Icon";

type Props = { children: ReactNode; icon?: tIcon | null };

const ServerFormSubmit = ({ children, icon }: Props) => {
  const { pending } = useFormStatus();
  if (icon) {
    if (pending) {
      <ClipLoader size={20} />;
    }
    return <Icon icon={icon} className="size-6" />;
  } else {
    if (pending) {
      return (
        <Button type="button" disabled>
          <ClipLoader size={20} className="mr-2" />
          Vänta
        </Button>
      );
    }
    return (
      <Button type="submit" disabled={pending}>
        {children}
      </Button>
    );
  }
};

export default ServerFormSubmit;
