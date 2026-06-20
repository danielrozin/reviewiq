// Apply pending Prisma migrations during the Vercel build (DAN-1085).
//
// WHY THIS EXISTS — the real prod deploy path is Vercel git-integration, which
// runs `npm run build` on every push to `main` but NEVER runs
// `prisma migrate deploy`. So a PR that adds a column (e.g. DAN-1085's
// `EmailSubscription.source`) ships code referencing a column the prod DB does
// not have yet — every write to that table then 500s silently until the
// migration is applied by hand. (The earlier fix in deploy-production.yml does
// not help: that workflow has no VERCEL_TOKEN and has never run.) Running the
// migrate here, inside the build Vercel actually executes, guarantees the schema
// is ahead of the code for all future schema changes.
//
// Behaviour:
//   - DATABASE_URL present  -> run `prisma migrate deploy`; a real failure throws
//                              and ABORTS the build (loud, never a silent 500).
//   - DATABASE_URL absent   -> skip (preview / local builds without a DB) and let
//                              the build continue; nothing to migrate against.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log(
    "[migrate-on-build] DATABASE_URL not set — skipping `prisma migrate deploy` (preview/local build)."
  );
  process.exit(0);
}

console.log("[migrate-on-build] Applying pending Prisma migrations to the target database…");
execSync("prisma migrate deploy", { stdio: "inherit" });
console.log("[migrate-on-build] Migrations applied.");
