/**
 * Scripts (tsx/ts-node) must load env before importing this module, e.g.
 * `import "./load-env"` as the first line — otherwise DATABASE_URL is unset
 * and the pg pool may connect to a DB named after the OS user.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Append sslmode=verify-full to silence pg-connection-string deprecation warning. */
function connectionStringWithSslMode(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.searchParams.has("sslmode")) return url;
    u.searchParams.set("sslmode", "verify-full");
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: connectionStringWithSslMode(process.env.DATABASE_URL),
      })
    ),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
