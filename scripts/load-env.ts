/**
 * Load `.env.local` then `.env` (first wins for duplicate keys).
 * Import this as the **first** import in any script that uses `lib/prisma`:
 * ESM evaluates static imports before other top-level code, so calling
 * dotenv in the same file *after* imports still runs too late — Prisma would
 * see an unset DATABASE_URL and connect to DB named after your OS user (e.g. `gp`).
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

const root = process.cwd();
for (const name of [".env.local", ".env"]) {
  const p = resolve(root, name);
  if (existsSync(p)) loadEnv({ path: p, override: false });
}
