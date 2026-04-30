import type { PrismaClient } from "@prisma/client";
import { CONSENT_RETENTION_YEARS } from "./consent";

export interface RetentionResult {
  cutoff: Date;
  deletedCount: number;
}

export function retentionCutoff(now: Date = new Date(), years: number = CONSENT_RETENTION_YEARS): Date {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - years);
  return cutoff;
}

export async function purgeExpiredConsentRecords(
  prisma: Pick<PrismaClient, "consentRecord">,
  options: { now?: Date; years?: number } = {}
): Promise<RetentionResult> {
  const cutoff = retentionCutoff(options.now, options.years);
  const result = await prisma.consentRecord.deleteMany({
    where: {
      grantedAt: { lt: cutoff },
    },
  });
  return { cutoff, deletedCount: result.count };
}
