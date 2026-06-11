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
 *   Q1 Intent              -> q1Intent     (reuses on-site INTENT_OPTIONS values: aggregates 1:1 with on-site q1)
 *   Q2 Barrier             -> q2Missing    (on-site "what was missing" == friction/barrier free text)
 *   Q3 Account willingness -> actionType   ("account_willing:yes|maybe|no"; actionType is UNUSED by the on-site popup, so no collision)
 *   Q4 email capture       -> optInEmail   (same opt-in column as on-site)
 *   Q4 alert frequency     -> q4Improvement ("alert_freq:weekly|monthly|major"; q4Improvement is unused by the trimmed instrument)
 *
 * NOTE: exact question wording / answer labels below are DRAFT pending the UX
 * Designer's finalized instrument (DAN-985). The VALUES (q1Intent codes,
 * account_willing codes, alert_freq codes) are the contract that must stay
 * stable for aggregation — labels can be re-skinned without touching the schema.
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
 * Q1 Intent options. Kept IDENTICAL to the on-site popup's INTENT_OPTIONS so the
 * q1Intent column aggregates across channels. If you change these, change them
 * in components/survey/SurveyPopup.tsx too.
 */
export const INTENT_OPTIONS = [
  { value: "researching", label: "Researching a product to buy" },
  { value: "comparing", label: "Comparing specific products" },
  { value: "reading_reviews", label: "Reading reviews" },
  { value: "writing_review", label: "Writing a review" },
  { value: "browsing", label: "Just browsing" },
] as const;

export type IntentValue = (typeof INTENT_OPTIONS)[number]["value"];

export function isIntentValue(v: string | null | undefined): v is IntentValue {
  return !!v && INTENT_OPTIONS.some((o) => o.value === v);
}

/** Q3 Account-willingness options (DRAFT labels; values are the stable contract). */
export const ACCOUNT_OPTIONS = [
  { value: "yes", label: "Yes — I'd create an account" },
  { value: "maybe", label: "Maybe, depends on the feature" },
  { value: "no", label: "No, not interested" },
] as const;

export type AccountValue = (typeof ACCOUNT_OPTIONS)[number]["value"];

/** Encode/decode Q3 account willingness into the actionType column. */
export const accountActionType = (v: AccountValue) => `account_willing:${v}`;

/** Q4 alert-frequency options (only relevant when the user provides an email). */
export const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "major", label: "Only on major SmartScore changes" },
] as const;

export type FrequencyValue = (typeof FREQUENCY_OPTIONS)[number]["value"];

/** Encode Q4 alert frequency into the q4Improvement column. */
export const frequencyField = (v: FrequencyValue) => `alert_freq:${v}`;
