import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const rootDir = process.cwd();
const envLocalPath = resolve(rootDir, ".env.local");
const envPath = resolve(rootDir, ".env");

// Load .env.local first (highest priority), then .env as fallback.
if (existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, override: false, quiet: true });
}
if (existsSync(envPath)) {
  loadEnv({ path: envPath, override: false, quiet: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
