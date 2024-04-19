"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getServerAuthSession = async () => {
  const { getUser, getPermission } = getKindeServerSession();
  const admin = await getPermission("is:admin");
  const user = await getUser();
  if (user) {
    return { ...user, admin: admin?.isGranted ?? false };
  }
  return null;
};
