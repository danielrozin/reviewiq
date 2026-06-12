/**
 * Email survey channel (DAN-984) — shared field mapping + constants.
 *
 * The email survey is a trimmed (3 core + 1 optional) variant of the 5-step
 * on-site instrument (components/survey/SurveyPopup.tsx). Both write to the SAME
 * table (`SmartreviewSurvey` via POST /api/surveys) so totals aggregate into one
 * dataset for DAN-176. This module is the single source of truth for how the
 * email instrument maps onto the existing columns — NO schema migration is
 * needed (every field below already exists on the model).
 *
 * Channel discriminator: every email-channel row carries
 * `referralSource = EMAIL_CHANNEL` so an analyst can separate email vs on-site
 * responses with a single filter while still rolling them up together.
 *
 * Field mapping (email Q -> existing column):
 *   Q1 Intent              -> q1Intent     (reuses LIVE on-site INTENT_OPTIONS values: aggregates 1:1 with on-site q1)
 *   Q2 Barrier             -> q2Missing    (canonical typed BARRIER_OPTIONS code; "other" stored as free text)
 *   Q3 Account willingness -> actionType   ("account_willing:yes|maybe|no"; actionType is UNUSED by the on-site popup, so no collision)
 *   Q4 email capture       -> optInEmail   (same opt-in column as on-site)
 *   Q4 alert frequency     -> q4Improvement ("alert_freq:realtime|weekly|monthly|major_only"; q4Improvement unused by trimmed instrument)
 *
 * RECONCILED against the UX Designer's finalized instrument (DAN-985, comment
 * 3e536dfb, 2026-06-12). Canonical VALUES applied:
 *   - Q1 intent: kept LIVE on-site INTENT_OPTIONS codes (researching|comparing|
 *     reading_reviews|writing_review|browsing). DAN-985's idealized Q1 codeframe
 *     (compare|read_reviews|check_score|write_review|browse|other) does NOT match
 *     the deployed on-site popup, so adopting it would BREAK the 1:1 aggregation
 *     this instrument exists to protect (and the ?intent= prefill). Migrating the
 *     on-site popup to the new codeframe is DAN-983's scope, not this build —
 *     flagged back to UX. Until then, email mirrors live on-site codes.
 *   - Q2 barrier: BARRIER_OPTIONS typed codeframe (DAN-985's sanctioned mapping:
 *     store canonical code in q2Missing; "other" -> free text).
 *   - Q3 account-willingness: yes|maybe|no in actionType ("account_willing:<v>").
 *   - Q4 frequency: realtime|weekly|monthly|major_only in q4Improvement
 *     ("alert_freq:<v>"). Email is the FIRST writer of this codeframe (on-site
 *     adopts notify_frequency later), so these values are now canonical.
 * Schema strategy: deliberately reuse existing columns (no migration). Vercel
 * never auto-runs Prisma migrations, so new columns would 500 prod survey writes
 * until DevOps applies a manual `migrate deploy`. UX permitted reuse provided the
 * VALUES + mapping intent hold. LABELS are presentational and re-skinnable.
 */

/** referralSource tag that marks a row as coming from the email channel. */
export const EMAIL_CHANNEL = "email_survey";

/** Funnel event names emitted by the email channel (the `event` column). */
export const EmailFunnelEvent = {
  Sent: "email_sent",
  Open: "email_open",
  LandingView: "landing_view",
  Partial: "partial",
  Submit: "form_submit",
} as const;

/** reachedStep values for the email funnel (drop-off analysis). */
export const EmailFunnelStep = {
  Sent: "sent",
  Open: "open",
  Landing: "landing",
  Q1: "q1",
  Submitted: "submitted",
} as const;

/**
 * Q1 Intent options. The `value` codes are IDENTICAL to the on-site popup's
 * INTENT_OPTIONS (components/survey/SurveyPopup.tsx) so q1Intent aggregates 1:1
 * across channels and the ?intent= prefill resolves — NEVER change a value here
 * without changing it on-site. The `label`s are email-channel presentational copy
 * (DAN-985 rev 2, UX-finalized) and may differ from on-site labels freely; labels
 * don't affect aggregation. DAN-985's draft `check_score`/`other` codes were
 * dropped — they don't exist on-site (logged as a DAN-983 future enhancement).
 */
export const INTENT_OPTIONS = [
  { value: "researching", label: "Researching products in general" },
  { value: "comparing", label: "Compare specific products before buying" },
  { value: "reading_reviews", label: "Read what other people experienced" },
  { value: "writing_review", label: "Write or update a review" },
  { value: "browsing", label: "Just browsing / curiosity" },
] as const;

export type IntentValue = (typeof INTENT_OPTIONS)[number]["value"];

export function isIntentValue(v: string | null | undefined): v is IntentValue {
  return !!v && INTENT_OPTIONS.some((o) => o.value === v);
}

/**
 * Q2 Barrier options (DAN-985 finalized typed codeframe). Email is the writer of
 * this codeframe; the canonical CODE is stored in q2Missing. "other" is stored as
 * the respondent's verbatim free text instead of the code (see barrierField).
 */
export const BARRIER_OPTIONS = [
  { value: "takes_too_long", label: "Writing a review takes too long / too much effort" },
  { value: "nothing_to_add", label: "Didn't feel I had anything useful to add" },
  { value: "account_required", label: "Don't want to create an account / log in" },
  { value: "privacy", label: "Privacy — don't want my activity or email tracked" },
  { value: "dont_trust", label: "Not sure my review would be shown fairly" },
  { value: "no_reason_to", label: "No real reason / incentive to bother" },
  { value: "other", label: "Other" },
] as const;

export type BarrierValue = (typeof BARRIER_OPTIONS)[number]["value"];

/**
 * Resolve the q2Missing value to store: the canonical barrier code for a fixed
 * choice, or the verbatim free text when the user picked "other". Returns
 * undefined when nothing usable was provided (Q2 is optional).
 */
export function barrierField(
  value: BarrierValue | "",
  otherText: string,
): string | undefined {
  if (value === "other") {
    const t = otherText.trim();
    return t ? t.slice(0, 200) : undefined;
  }
  return value || undefined;
}

/** Q3 Account-willingness options. Values yes|maybe|no match DAN-985's
 *  `account_willingness` enum (the stable aggregation contract); labels are the
 *  finalized DAN-985 copy. */
export const ACCOUNT_OPTIONS = [
  { value: "yes", label: "Yes — that sounds useful" },
  { value: "maybe", label: "Maybe, depending on how it works" },
  { value: "no", label: "No, I'd rather stay without an account" },
] as const;

export type AccountValue = (typeof ACCOUNT_OPTIONS)[number]["value"];

/** Encode/decode Q3 account willingness into the actionType column. */
export const accountActionType = (v: AccountValue) => `account_willing:${v}`;

/**
 * Q4 alert-frequency options (only relevant when the user provides an email).
 * DAN-985 finalized 4-value set; email is the first writer so these are canonical.
 */
export const FREQUENCY_OPTIONS = [
  { value: "realtime", label: "As changes happen" },
  { value: "weekly", label: "Weekly digest" },
  { value: "monthly", label: "Monthly digest" },
  { value: "major_only", label: "Only for big SmartScore changes" },
] as const;

export type FrequencyValue = (typeof FREQUENCY_OPTIONS)[number]["value"];

/** Encode Q4 alert frequency into the q4Improvement column. */
export const frequencyField = (v: FrequencyValue) => `alert_freq:${v}`;
