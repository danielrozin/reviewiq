import { prisma } from "@/lib/prisma";

/**
 * Consent-gated audience for the survey-invite email (DAN-984).
 *
 * HARD REQUIREMENT (issue): send ONLY to recipients who have given marketing
 * consent. No consent -> no send.
 *
 * IMPORTANT consent-model note (flagged on DAN-984 / DAN-176):
 *   The `ConsentRecord` table named in the issue is an ANONYMOUS GDPR cookie-
 *   consent record — keyed on `visitorId`, with NO email address — so it cannot
 *   by itself gate an email list (you can't email a visitorId). The first-party,
 *   per-identity, user-managed marketing-email opt-in actually present in the
 *   schema is `NotificationPreference.weeklyDigest` (a digest toggle backed by an
 *   unsubscribe token). We therefore treat `weeklyDigest === true` as the
 *   marketing-consent signal for email, restricted to users with a real address.
 *   This predicate is isolated here so it can be swapped in one place once the
 *   consent source is confirmed by Product/Legal.
 *
 * Eligibility (all must hold):
 *   1. User has a non-null email.
 *   2. User has an explicit opt-in: NotificationPreference.weeklyDigest === true.
 *   3. (default) User is an "existing reviewer" — authored >= 1 Review — matching
 *      the issue's "email-to-existing-reviewers" audience. Set
 *      `reviewersOnly: false` to widen to all consented users if the reviewer
 *      pool is too small to fill a batch.
 *   4. Not already sent a survey invite (EmailLog dedup, emailType below).
 */

export const SURVEY_INVITE_EMAIL_TYPE = "survey_invite";

export interface Recipient {
  userId: string;
  email: string;
  name: string | null;
}

export interface AudienceOptions {
  /** Restrict to users who authored >=1 Review. Default true ("existing reviewers"). */
  reviewersOnly?: boolean;
  /** Max recipients to return (staged batch size). */
  limit?: number;
}

export interface AudienceCounts {
  withEmail: number;
  consented: number;
  consentedReviewers: number;
  alreadySent: number;
  /** Eligible NOW under the active options (consent + dedup + reviewer gate). */
  eligible: number;
}

/** Build the Prisma `where` for consented, emailable users (optionally reviewers). */
function eligibleWhere(reviewersOnly: boolean) {
  return {
    email: { not: null },
    notificationPref: { is: { weeklyDigest: true } },
    ...(reviewersOnly ? { reviews: { some: {} } } : {}),
  } as const;
}

/**
 * Diagnostic counts for staging decisions — run this (dry-run) BEFORE any send so
 * the operator knows the real audience size against live consent state.
 */
export async function getAudienceCounts(): Promise<AudienceCounts> {
  const [withEmail, consented, consentedReviewers, alreadySent] = await Promise.all([
    prisma.user.count({ where: { email: { not: null } } }),
    prisma.user.count({ where: { email: { not: null }, notificationPref: { is: { weeklyDigest: true } } } }),
    prisma.user.count({ where: eligibleWhere(true) }),
    prisma.emailLog.count({ where: { emailType: SURVEY_INVITE_EMAIL_TYPE } }),
  ]);

  // Eligible = consented reviewers minus those already sent.
  const sentUserIds = await prisma.emailLog.findMany({
    where: { emailType: SURVEY_INVITE_EMAIL_TYPE },
    select: { userId: true },
  });
  const sentSet = new Set(sentUserIds.map((r) => r.userId));
  const reviewerRows = await prisma.user.findMany({
    where: eligibleWhere(true),
    select: { id: true },
  });
  const eligible = reviewerRows.filter((u) => !sentSet.has(u.id)).length;

  return { withEmail, consented, consentedReviewers, alreadySent, eligible };
}

/**
 * Return up to `limit` consent-gated recipients who have NOT yet been sent the
 * invite. Dedup is enforced against EmailLog so re-runs never double-send (this
 * protects the one-time ask across staged batches).
 */
export async function getEligibleRecipients(opts: AudienceOptions = {}): Promise<Recipient[]> {
  const reviewersOnly = opts.reviewersOnly ?? true;
  const limit = opts.limit ?? 200;

  const alreadySent = await prisma.emailLog.findMany({
    where: { emailType: SURVEY_INVITE_EMAIL_TYPE },
    select: { userId: true },
  });
  const sentSet = new Set(alreadySent.map((r) => r.userId));

  // Over-fetch then filter out already-sent in app code (EmailLog has no FK to
  // User we can join on cleanly here), capping at `limit` afterwards.
  const candidates = await prisma.user.findMany({
    where: eligibleWhere(reviewersOnly),
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
    take: limit + sentSet.size,
  });

  const recipients: Recipient[] = [];
  for (const u of candidates) {
    if (recipients.length >= limit) break;
    if (!u.email) continue;
    if (sentSet.has(u.id)) continue;
    recipients.push({ userId: u.id, email: u.email, name: u.name });
  }
  return recipients;
}
