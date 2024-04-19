import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import React from "react";

const Login = () => {
  return (
    <div className="flex flex-col gap-2">
      <LoginLink>Logga in</LoginLink>
      <RegisterLink>Registrera</RegisterLink>
    </div>
  );
};

export default Login;
