import { redirect } from "next/navigation";
import { createAccount } from "~/server/api/users";
import { getServerAuthSession } from "~/server/auth";

const page = async () => {
  const user = await getServerAuthSession();
  if (!user) {
    redirect("/login");
  }
  await createAccount(user);
  redirect("/");
};

export default page;
