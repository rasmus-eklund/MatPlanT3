import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import RegisterUserForm from "./_components/RegisterUserForm";
import { hasAccount } from "~/server/api/users";

const RegisterUser = async () => {
  const userData = await getServerAuthSession();
  if (!userData) {
    redirect("/api/auth/login?");
  }
  const hasAcc = await hasAccount(userData.authId);
  if (hasAcc) {
    redirect("/menu");
  }
  return (
    <div className="flex flex-col gap-5 bg-c3 p-10">
      <h1 className="rounded-md bg-c5 p-2 text-center text-lg text-c1">Registrera ny användare</h1>
      <RegisterUserForm userData={userData} />
    </div>
  );
};

export default RegisterUser;
