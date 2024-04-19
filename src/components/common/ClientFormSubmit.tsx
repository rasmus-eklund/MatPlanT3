"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

type Props = { content: string };

const ClientFormSubmit = ({ content, ...props }: Props) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" {...props} disabled={pending}>
      {content}
    </Button>
  );
};

export default ClientFormSubmit;
