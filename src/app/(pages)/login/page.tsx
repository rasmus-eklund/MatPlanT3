import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import React from "react";
import { getServerAuthSession } from "~/server/auth";

const LoginPage = async () => {
  const user = await getServerAuthSession();
  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <LogoutLink>Logga ut</LogoutLink>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <LoginLink>Logga in</LoginLink>
      <RegisterLink>Registrera</RegisterLink>
    </div>
  );
};

export default LoginPage;
