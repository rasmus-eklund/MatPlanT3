"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { UserSession } from "./shared";
import { errorMessages } from "./errors";

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
): Promise<NonNullable<UserSession>> => {
  const user = await getServerAuthSession();
  if (!user || (admin && !user.admin)) {
    throw new Error(errorMessages.UNAUTHORIZED);
  }
  return user;
};
