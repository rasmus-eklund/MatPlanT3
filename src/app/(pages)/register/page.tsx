import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import RegisterUserForm from "./_components/RegisterUserForm";
import { hasAccount } from "~/server/api/users";

const RegisterUser = async () => {
  const user = await getServerAuthSession();
  if (!user) {
    redirect("/api/auth/login?");
  }
  const hasAcc = await hasAccount(user.authId);
  if (hasAcc) {
    redirect("/menu");
  }
  return (
    <div className="flex flex-col gap-5 bg-c3 p-10">
      <h1 className="rounded-md bg-c5 p-2 text-center text-lg text-c1">
        Registrera ny användare
      </h1>
      <RegisterUserForm user={user} />
    </div>
  );
};

export default RegisterUser;
