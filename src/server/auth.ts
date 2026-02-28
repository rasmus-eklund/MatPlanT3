"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";

export type User = { id: string; admin: boolean };

export const getServerAuthSession = async (getAdmin = false) => {
  const { getUser, getPermission } = getKindeServerSession();
  const [user, admin] = await Promise.all([
    getUser(),
    getAdmin ? getPermission("is:admin") : { isGranted: false },
  ]);
  if (user) {
    const { id, ...rest } = user;
    return { authId: id, ...rest, admin: admin?.isGranted ?? false };
  }
  return null;
};

export const authorize = async (admin = false): Promise<User> => {
  const user = await getServerAuthSession(admin);
  if (!user || (admin && !user.admin)) {
    redirect("/api/auth/login");
  }
  const dbUser = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.authId, user.authId),
  });
  if (!dbUser) {
    redirect("/register");
  }
  return { id: dbUser.id, admin: user.admin };
};
