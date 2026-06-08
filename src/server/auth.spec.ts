import "~/test/setup-backend";

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { createUser, resetRecipeTables } from "~/test/recipeTestHarness";

const authState: {
  authId: string | null;
  admin: boolean;
} = {
  authId: null,
  admin: false,
};

void mock.module("@kinde-oss/kinde-auth-nextjs/server", () => ({
  getKindeServerSession: () => ({
    getUser: async () =>
      authState.authId
        ? {
            id: authState.authId,
            email: "user@example.com",
            given_name: "Test",
            family_name: "User",
            picture: null,
          }
        : null,
    getPermission: async () => ({ isGranted: authState.admin }),
  }),
}));

void mock.module("next/navigation", () => ({
  notFound: (): never => {
    throw new Error("notFound");
  },
  redirect: (url: string): never => {
    throw new Error(`redirect:${url}`);
  },
}));

const { authorize } = await import("./auth");

const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  expect(user).toBeDefined();
  return user!;
};

describe("authorize lastActiveAt tracking", () => {
  beforeEach(async () => {
    authState.authId = null;
    authState.admin = false;
    await resetRecipeTables();
  });

  test("sets lastActiveAt for registered users without previous activity", async () => {
    const user = createUser();
    await db.insert(users).values(user);
    authState.authId = user.authId;

    const before = Date.now();
    await authorize();
    const after = Date.now();

    const updatedUser = await getUser(user.id);
    expect(updatedUser.lastActiveAt).toBeInstanceOf(Date);
    expect(updatedUser.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(before);
    expect(updatedUser.lastActiveAt!.getTime()).toBeLessThanOrEqual(after);
  });

  test("does not rewrite recent lastActiveAt values", async () => {
    const recentLastActiveAt = new Date(Date.now() - 30 * 60 * 1000);
    const user = createUser({ lastActiveAt: recentLastActiveAt });
    await db.insert(users).values(user);
    authState.authId = user.authId;

    await authorize();

    const updatedUser = await getUser(user.id);
    expect(updatedUser.lastActiveAt?.getTime()).toBe(
      recentLastActiveAt.getTime(),
    );
  });

  test("refreshes stale lastActiveAt values", async () => {
    const staleLastActiveAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const user = createUser({ lastActiveAt: staleLastActiveAt });
    await db.insert(users).values(user);
    authState.authId = user.authId;

    const before = Date.now();
    await authorize();

    const updatedUser = await getUser(user.id);
    expect(updatedUser.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(before);
    expect(updatedUser.lastActiveAt!.getTime()).toBeGreaterThan(
      staleLastActiveAt.getTime(),
    );
  });
});
