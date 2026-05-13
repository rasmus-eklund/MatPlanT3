"use client";
import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "../ui/button";

type Props = Omit<ButtonProps, "onClick" | "type"> & {
  children?: ReactNode;
};

const BackButton = ({
  children = "Tillbaka",
  variant = "secondary",
  ...props
}: Props) => {
  const router = useRouter();
  return (
    <Button
      {...props}
      variant={variant}
      type="button"
      onClick={() => router.back()}
    >
      {children}
    </Button>
  );
};

export default BackButton;
