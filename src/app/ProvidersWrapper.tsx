"use client";
import { SessionProvider } from "next-auth/react";
import type { FC } from "react";

type ProvidersWrapperProps = {
  children: React.ReactNode;
};
const ProvidersWrapper: FC<ProvidersWrapperProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ProvidersWrapper;
