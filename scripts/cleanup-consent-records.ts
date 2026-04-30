/**
 * GDPR retention cleanup: deletes ConsentRecord rows older than 3 years.
 * Intended cadence: monthly (e.g. Vercel Cron on the 1st of each month).
 *
 * Run manually: npm run cleanup:consent
 */
import { prisma } from "../lib/prisma";
import { purgeExpiredConsentRecords, retentionCutoff } from "../lib/consent-retention";

async function main() {
  const cutoff = retentionCutoff();
  console.log(`[consent-retention] Deleting ConsentRecord rows with grantedAt < ${cutoff.toISOString()}`);

  const { deletedCount } = await purgeExpiredConsentRecords(prisma);

  console.log(`[consent-retention] Deleted ${deletedCount} expired consent records`);
}

main()
  .catch((error) => {
    console.error("[consent-retention] Failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
