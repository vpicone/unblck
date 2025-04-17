import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env.development.local" });

const url = process.env.DATABASE_URL || "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/db/schema.ts",
  out: "./app/db",
  dbCredentials: {
    url,
  },
});
