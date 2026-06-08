import "~/test/setup-backend";

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  auditLog,
  items,
  menu,
  recipe,
  store,
  users,
} from "~/server/db/schema";
import {
  createItemRow,
  createMenuRow,
  createRecipeRow,
  resetRecipeTables,
  seedBaseFixtures,
} from "~/test/recipeTestHarness";

const authState: {
  authorizedUser: { id: string; admin: boolean } | null;
} = {
  authorizedUser: null,
};

void mock.module("../auth", () => ({
  authorize: async (admin = false) => {
    if (!authState.authorizedUser) {
      throw new Error("Test did not configure an authorized user");
    }
    if (admin && !authState.authorizedUser.admin) {
      throw new Error("Expected admin authorization");
    }
    return authState.authorizedUser;
  },
}));

void mock.module("next/cache", () => ({
  revalidatePath: () => undefined,
}));

void mock.module("next/navigation", () => ({
  notFound: (): never => {
    throw new Error("notFound");
  },
  redirect: (url: string): never => {
    throw new Error(`redirect:${url}`);
  },
}));

const { getAllUsers } = await import("./users");

describe("getAllUsers activity data", () => {
  beforeEach(async () => {
    authState.authorizedUser = null;
    await resetRecipeTables();
  });

  test("returns lastActiveAt and latest audit timestamp while preserving counts", async () => {
    const lastActiveAt = new Date("2026-06-08T10:00:00.000Z");
    const olderAuditAt = new Date("2026-06-01T10:00:00.000Z");
    const latestAuditAt = new Date("2026-06-07T10:00:00.000Z");
    const { user, otherUser, ingredients } = await seedBaseFixtures();
    await db.update(users).set({ lastActiveAt }).where(eq(users.id, user.id));

    const recipeRow = createRecipeRow(user.id);
    const menuRow = createMenuRow(user.id, recipeRow.id);
    await db.insert(recipe).values(recipeRow);
    await db.insert(menu).values(menuRow);
    await db.insert(store).values({
      name: "Store",
      slug: "store",
      userId: user.id,
    });
    await db.insert(items).values(
      createItemRow(user.id, ingredients.flour.id, {
        menuId: menuRow.id,
        recipeIngredientId: null,
      }),
    );
    await db.insert(auditLog).values([
      {
        method: "create",
        action: "olderAction",
        data: {},
        userId: user.id,
        createdAt: olderAuditAt,
      },
      {
        method: "update",
        action: "latestAction",
        data: {},
        userId: user.id,
        createdAt: latestAuditAt,
      },
    ]);
    authState.authorizedUser = { id: user.id, admin: true };

    const result = await getAllUsers();
    const userRow = result.find((row) => row.id === user.id);
    const otherUserRow = result.find((row) => row.id === otherUser.id);

    expect(userRow).toBeDefined();
    expect(userRow!.lastActiveAt?.getTime()).toBe(lastActiveAt.getTime());
    expect(userRow!.lastAuditAt?.getTime()).toBe(latestAuditAt.getTime());
    expect(userRow!.count).toEqual({
      items: 1,
      store: 1,
      recipe: 1,
      menu: 1,
    });
    expect(otherUserRow).toBeDefined();
    expect(otherUserRow!.lastActiveAt).toBeNull();
    expect(otherUserRow!.lastAuditAt).toBeNull();
  });
});
