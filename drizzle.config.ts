import { type Config } from "drizzle-kit";

import { env } from "~/env";

const databaseUrl = env.DATABASE_URL ?? "postgresql://localhost:5432/appeloffresaas";

export default {
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  tablesFilter: ["appeloffresaas_*"],
} satisfies Config;
