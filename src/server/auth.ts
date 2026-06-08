"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export type User = { id: string; admin: boolean };

const LAST_ACTIVE_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export const getServerAuthSession = async (getAdmin = false) => {
  const { getUser, getPermission } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    return null;
  }
  let isAdmin = false;
  if (getAdmin) {
    const permission = await getPermission("is:admin");
    isAdmin = permission?.isGranted ?? false;
  }
  const { id, ...rest } = user;
  return { authId: id, ...rest, admin: isAdmin };
};

export const authorize = async (
  admin = false,
  returnTo?: string,
): Promise<User> => {
  const user = await getServerAuthSession(admin);
  if (!user || (admin && !user.admin)) {
    redirect(
      `/api/auth/login${returnTo ? `?post_login_redirect_url=${returnTo}` : ""}`,
    );
  }
  const dbUser = await db.query.users.findFirst({
    where: (model, { eq }) => eq(model.authId, user.authId),
  });
  if (!dbUser) {
    redirect("/register");
  }
  const now = new Date();
  const shouldUpdateLastActive =
    !dbUser.lastActiveAt ||
    now.getTime() - dbUser.lastActiveAt.getTime() >
      LAST_ACTIVE_UPDATE_INTERVAL_MS;

  if (shouldUpdateLastActive) {
    await db
      .update(users)
      .set({ lastActiveAt: now })
      .where(eq(users.id, dbUser.id));
  }

  return { id: dbUser.id, admin: user.admin };
};
