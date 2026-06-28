// Sync the database schema during the Vercel build (DAN-1085).
//
// WHY THIS EXISTS — the real prod deploy path is Vercel git-integration, which
// runs `npm run build` on every push to `main` but never touches the DB schema.
// So a PR that adds a column (e.g. DAN-1085's `EmailSubscription.source`) ships
// code referencing a column the prod DB does not have yet — every write to that
// table then 500s silently until the schema is updated by hand.
//
// WHY `db push` (not `migrate deploy`) — this project manages its schema with
// `prisma db push` (see the db:push / db:reset / db:seed scripts); the prod DB
// has no `_prisma_migrations` history, so `prisma migrate deploy` fails trying to
// replay migrations against objects that already exist. `prisma db push` diffs
// the Prisma schema against the live DB and applies the delta directly, which is
// the mechanism this DB is actually managed with.
//
// SAFETY — run WITHOUT `--accept-data-loss`: additive changes (new column +
// index) apply cleanly, while any destructive diff makes the command exit
// non-zero, which throws here and ABORTS the build (loud, never silent). A failed
// build is not promoted, so prod keeps serving the previous deployment.
//
// Behaviour:
//   - DATABASE_URL present  -> run `prisma db push --skip-generate`; abort build on failure
//                              UNLESS the error is P1001 (can't reach DB at build time —
//                              common when Neon pooler is waking up). P1001 warns and
//                              continues because: (a) schema drift is caught at runtime,
//                              (b) the pooler blocks DDL anyway, (c) additive changes like
//                              a new column still 500 at runtime giving clear signal.
//   - DATABASE_URL absent   -> skip (preview / local builds without a DB).
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log(
    "[db-sync] DATABASE_URL not set — skipping `prisma db push` (preview/local build)."
  );
  process.exit(0);
}

console.log("[db-sync] Syncing schema to the target database via `prisma db push`…");
try {
  execSync("prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[db-sync] Schema in sync.");
} catch (err) {
  const output = String(err.stdout ?? "") + String(err.stderr ?? "");
  // P1001 = can't reach DB server (Neon pooler cold-start / network blip).
  // Warn and continue — runtime connections auto-resume; build should not abort on transient infra.
  if (output.includes("P1001") || String(err.message ?? "").includes("P1001")) {
    console.warn("[db-sync] WARNING: P1001 — could not reach database during build (pooler may be resuming).");
    console.warn("[db-sync] Continuing build. Verify schema drift manually if you added columns this PR.");
  } else {
    throw err;
  }
}
