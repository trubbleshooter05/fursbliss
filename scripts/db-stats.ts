/**
 * Print quick DB counts. Uses the same Prisma client as the app (adapter + .env).
 *
 *   npm run db:stats
 *
 * `load-env` must be the first import — see scripts/load-env.ts.
 */
import "./load-env";
import { prisma } from "../lib/prisma";

/** Log DB name from DATABASE_URL (no password) for debugging wrong-DB errors. */
function logEffectiveDatabase() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    console.error("[db-stats] DATABASE_URL is not set.");
    return;
  }
  try {
    const normalized = raw.replace(/^postgres:\/\//i, "postgresql://");
    const u = new URL(normalized);
    const name = decodeURIComponent((u.pathname || "").replace(/^\//, "").split("/")[0] || "");
    if (name) console.error(`[db-stats] Connecting to database: "${name}"`);
  } catch {
    console.error("[db-stats] DATABASE_URL is set but could not be parsed.");
  }
}

async function main() {
  logEffectiveDatabase();
  const [users, premium, quiz, pets] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "premium" } }),
    prisma.quizSubmission.count(),
    prisma.pet.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        users,
        premium,
        freeOrOther: users - premium,
        quizSubmissions: quiz,
        pets,
        asOf: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    const code = e && typeof e === "object" && "code" in e ? (e as { code?: string }).code : undefined;
    if (code === "P1003") {
      console.error(
        "\n[db-stats] Database missing or URL wrong. " +
          "If the name matches your macOS username (e.g. gp), the script likely ran before `.env` loaded — " +
          "ensure `import \"./load-env\"` is the first import. Otherwise fix `DATABASE_URL` in `.env`.\n"
      );
    }
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
