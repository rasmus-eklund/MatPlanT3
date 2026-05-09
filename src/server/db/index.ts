import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const isServerless = Boolean(
  process.env.VERCEL ?? process.env.AWS_LAMBDA_FUNCTION_NAME,
);

const conn =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    max: env.DATABASE_MAX_CONNECTIONS ?? (isServerless ? 1 : 10),
    prepare: env.DATABASE_PREPARE ?? !isServerless,
  });

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
