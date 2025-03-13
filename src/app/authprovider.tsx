"use client";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

type Props = {
  children: React.ReactNode;
};
export const AuthProvider = ({ children }: Props) => {
  return <KindeProvider>{children}</KindeProvider>;
};
