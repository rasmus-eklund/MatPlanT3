import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "pg",
  out: "./sql",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: ["MatPlan_*"],
} satisfies Config;
