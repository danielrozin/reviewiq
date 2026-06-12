import { prisma } from "@/lib/prisma";

/**
 * Consent-gated audience for the survey-invite email (DAN-984).
 *
 * HARD REQUIREMENT (issue): send ONLY to recipients who have given marketing
 * consent. No consent -> no send.
 *
 * CONSENT BASIS — APPROVED by VP Product (DAN-1066 ruling, applies DAN-984):
 *   The `ConsentRecord` table named in the original issue is an ANONYMOUS GDPR
 *   cookie-consent record — keyed on `visitorId`, with NO email address — so it
 *   cannot by itself gate an email list (you can't email a visitorId). The
 *   approved consent signal is `NotificationPreference.weeklyDigest === true`:
 *   an explicit, first-party, granular *email* opt-in from existing users. A
 *   one-time product-improvement survey sits within the reasonable scope of that
 *   relationship. Guardrails (per ruling):
 *     - One-time only — never persist recipients to a new list; never re-send to
 *       this gate (EmailLog dedup enforces this across batches).
 *     - Evaluate the predicate against LIVE preference state at send time, not a
 *       cached snapshot — this query runs live, and an unsubscribe flips
 *       weeklyDigest=false (see app/unsubscribe/[token]/page.tsx) so unsubscribed
 *       users are auto-suppressed from the gate on the next batch.
 *
 * AUDIENCE SCOPE — APPROVED by VP Product (DAN-1066): send to ALL consented
 *   users, NOT reviewers-only. Q2 (what stops you writing a review / signing up)
 *   and Q3 (account willingness) are most valuable from people who haven't
 *   converted; restricting to existing reviewers biases out the non-converters we
 *   need and risks falling under n>=30. Batch-1 is randomly sampled from the full
 *   consented pool. `reviewersOnly` remains available as an override but DEFAULTS
 *   TO false per the ruling.
 *
 * Eligibility (all must hold):
 *   1. User has a non-null email.
 *   2. User has an explicit opt-in: NotificationPreference.weeklyDigest === true.
 *   3. Not already sent a survey invite (EmailLog dedup, emailType below).
 *   (reviewersOnly is an optional, off-by-default narrowing for diagnostics.)
 */

export const SURVEY_INVITE_EMAIL_TYPE = "survey_invite";

export interface Recipient {
  userId: string;
  email: string;
  name: string | null;
}

export interface AudienceOptions {
  /**
   * Restrict to users who authored >=1 Review. DEFAULT false per VP Product
   * ruling (DAN-1066): send to all consented users, not reviewers-only.
   */
  reviewersOnly?: boolean;
  /** Max recipients to return (staged batch size). */
  limit?: number;
}

export interface AudienceCounts {
  withEmail: number;
  /** All users with email + weeklyDigest=true — the full consented pool. */
  consented: number;
  /** Informational: subset of consented who authored >=1 review. */
  consentedReviewers: number;
  alreadySent: number;
  /**
   * Eligible NOW = full consented pool minus already-sent (the audience batch-1
   * is randomly sampled from, per the DAN-1066 all-consented ruling).
   */
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
    prisma.user.count({ where: eligibleWhere(false) }),
    prisma.user.count({ where: eligibleWhere(true) }),
    prisma.emailLog.count({ where: { emailType: SURVEY_INVITE_EMAIL_TYPE } }),
  ]);

  // Eligible = full consented pool (all weeklyDigest=true, not reviewers-only)
  // minus those already sent. This is the pool batch-1 is sampled from.
  const sentUserIds = await prisma.emailLog.findMany({
    where: { emailType: SURVEY_INVITE_EMAIL_TYPE },
    select: { userId: true },
  });
  const sentSet = new Set(sentUserIds.map((r) => r.userId));
  const consentedRows = await prisma.user.findMany({
    where: eligibleWhere(false),
    select: { id: true },
  });
  const eligible = consentedRows.filter((u) => !sentSet.has(u.id)).length;

  return { withEmail, consented, consentedReviewers, alreadySent, eligible };
}

/**
 * Return up to `limit` consent-gated recipients who have NOT yet been sent the
 * invite, RANDOMLY SAMPLED from the eligible pool (per the DAN-1066 ruling:
 * batch-1 is a random sample of the full consented pool, not the oldest N).
 * Dedup is enforced against EmailLog so re-runs never double-send — this
 * protects the one-time ask across staged batches.
 */
export async function getEligibleRecipients(opts: AudienceOptions = {}): Promise<Recipient[]> {
  // Default to ALL consented users (not reviewers-only) per VP Product ruling.
  const reviewersOnly = opts.reviewersOnly ?? false;
  const limit = opts.limit ?? 200;

  const alreadySent = await prisma.emailLog.findMany({
    where: { emailType: SURVEY_INVITE_EMAIL_TYPE },
    select: { userId: true },
  });
  const sentSet = new Set(alreadySent.map((r) => r.userId));

  // Fetch the FULL eligible pool (not just the first N) so the random sample is
  // drawn across all consented users, not biased to oldest accounts. The pool is
  // bounded by the consented-user count, which is small enough to hold in memory.
  const candidates = await prisma.user.findMany({
    where: eligibleWhere(reviewersOnly),
    select: { id: true, email: true, name: true },
  });

  // Filter out already-sent + null email, then random-sample down to `limit`.
  const pool: Recipient[] = [];
  for (const u of candidates) {
    if (!u.email) continue;
    if (sentSet.has(u.id)) continue;
    pool.push({ userId: u.id, email: u.email, name: u.name });
  }

  // Fisher-Yates shuffle, then take the first `limit`. Random sampling removes
  // signup-age bias from the batch so completion-rate reads cleanly.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}
