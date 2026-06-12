# DAN-984 — Email distribution channel for the SmartReview survey

Consent-gated, one-click, staged email send that drives existing users to a
trimmed survey, feeding the SAME dataset as the on-site instrument (DAN-176).

## What shipped (code)

| Piece | File |
| --- | --- |
| Field-mapping + channel constants (single source of truth) | `lib/survey/email-channel.ts` |
| Consent-gated audience query + dedup + diagnostics | `lib/survey/email-audience.ts` |
| Invite email builder + staged send (dry-run default) | `lib/survey/email-invite.ts` |
| Operator console (admin-gated GET counts / POST send) | `app/api/admin/survey-invites/route.ts` |
| Dedicated landing page (`/survey`, Q1 prefill) | `app/survey/page.tsx` |
| Trimmed 3+1 instrument (client form + funnel events) | `components/survey/EmailSurveyForm.tsx` |
| Open-tracking pixel → `email_open` funnel row | `app/api/survey-pixel/route.ts` |
| Notify gate tightened to completion-only | `app/api/surveys/route.ts` |

No DB migration — every column used already exists on `SmartreviewSurvey`.

## Field mapping (email Q → existing column)

The trimmed email instrument is a 3-core-+-1-optional variant of the 5-step
on-site popup. Both write to `SmartreviewSurvey` so totals roll up. Every
email-channel row carries `referralSource = "email_survey"` (the channel tag).

| Email Q | Column | Encoding |
| --- | --- | --- |
| Q1 Intent | `q1Intent` | same `INTENT_OPTIONS` codes as on-site → aggregates 1:1 |
| Q2 Barrier | `q2Missing` | free text (on-site "what was missing" == friction) |
| Q3 Account willingness | `actionType` | `account_willing:yes\|maybe\|no` (unused on-site → no collision) |
| Q4 email capture | `optInEmail` | same opt-in column as on-site |
| Q4 alert frequency | `q4Improvement` | `alert_freq:weekly\|monthly\|major` (unused by trimmed instrument) |

Funnel events (`event` column), all tagged `referralSource = "email_survey"`:
`email_sent` → `email_open` → `landing_view` → `partial` → `form_submit`
(`surveyCompleted = true`). Completion rate = completions ÷ `email_sent`.

## ⚠️ Open decision 1 — consent source

The issue mandates "send only to `ConsentRecord` marketing-consent = true." But
`ConsentRecord` is an **anonymous cookie-consent record** (`visitorId`, no
email) — it cannot gate an email list. The first-party, per-identity email
opt-in actually in the schema is **`NotificationPreference.weeklyDigest`**
(user-managed, unsubscribe-token backed), which the audience query currently
treats as the marketing-consent signal. **Product/Legal must confirm** this is
the correct consent source before a real send. Swapping it is one predicate in
`lib/survey/email-audience.ts → eligibleWhere()`.

## ⚠️ Open decision 2 — authorization + access to actually send

The real send needs all of: (1) prod `DATABASE_URL` to run the consent query
(DevOps-owned; not available in the dev sandbox), (2) prod `RESEND_API_KEY` +
verified `RESEND_FROM_EMAIL` domain, (3) decision 1 resolved, (4) a human go.
Sending is outward-facing and irreversible, so it is **never automated** —
`POST` is dry-run unless `confirm: true`.

## Runbook (operator with prod access)

1. **Counts (sends nothing):** `GET /api/admin/survey-invites` (admin cookie) →
   `{ withEmail, consented, consentedReviewers, alreadySent, eligible }`.
   If `eligible` < ~30, widen with `reviewersOnly: false` (decision for VP Product).
2. **Dry-run batch-1:** `POST /api/admin/survey-invites` body `{ "limit": 150, "batch": "b1" }`
   → returns `attempted` with `dryRun: true`, sends nothing.
3. **Real batch-1:** add `"confirm": true`. Sends ≤150 consented invites, logs
   `EmailLog` (dedup) + one `email_sent` row each.
4. **Measure:** completion rate for batch-1 =
   `count(form_submit & surveyCompleted, referralSource=email_survey, batch b1)` ÷
   `count(email_sent, batch b1)`. Report on **DAN-176** before the full send.
5. **Full send (gated on healthy batch-1):** repeat step 3 with a higher `limit`;
   `EmailLog` dedup guarantees no one is emailed twice across batches.

## Notes

- One-click: the email CTA links to `/survey?intent=<code>`; Q1 is prefilled and
  the recipient lands one question deep. `/survey` is a dedicated page, not the popup.
- `/survey` is `noindex` (private instrument, not an SEO surface).
- Open tracking is directional (image-load dependent); treat `email_sent` and
  `landing_view`/completion as the reliable denominators.
