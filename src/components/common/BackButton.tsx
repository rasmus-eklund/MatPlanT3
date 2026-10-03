"use client";
import { type ReactNode, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

type Props = Omit<ComponentProps<typeof Button>, "onClick" | "type"> & {
  children?: ReactNode;
};

const BackButton = ({ children = "Tillbaka", variant = "secondary", ...props }: Props) => {
  const router = useRouter();
  return (
    <Button {...props} variant={variant} type="button" onClick={() => router.back()}>
      {children}
    </Button>
  );
};

export default BackButton;
