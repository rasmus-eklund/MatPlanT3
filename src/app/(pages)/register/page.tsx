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
    <div className="bg-c3 flex flex-col gap-5 p-10">
      <h1 className="bg-c5 text-c1 rounded-md p-2 text-center text-lg">
        Registrera ny användare
      </h1>
      <RegisterUserForm userData={userData} />
    </div>
  );
};

export default RegisterUser;
