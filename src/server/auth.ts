"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";

export const getServerAuthSession = async () => {
  const { getUser, getPermission } = getKindeServerSession();
  const admin = await getPermission("is:admin");
  const user = await getUser();
  if (user) {
    const { id, ...rest } = user;
    return { authId: id, ...rest, admin: admin?.isGranted ?? false };
  }
  return null;
};

export const authorize = async (
  admin = false,
): Promise<{ id: string; admin: boolean }> => {
  const user = await getServerAuthSession();
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
