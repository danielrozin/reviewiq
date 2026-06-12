import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/email/tokens";
import {
  EMAIL_CHANNEL,
  EmailFunnelEvent,
  EmailFunnelStep,
  INTENT_OPTIONS,
  type IntentValue,
} from "@/lib/survey/email-channel";
import {
  getEligibleRecipients,
  SURVEY_INVITE_EMAIL_TYPE,
  type AudienceOptions,
  type Recipient,
} from "@/lib/survey/email-audience";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/** One-click link to the dedicated /survey landing, with Q1 intent prefilled. */
function surveyUrl(intent?: IntentValue): string {
  const q = intent ? `?intent=${encodeURIComponent(intent)}` : "";
  return `${SITE_URL}/survey${q}`;
}

/**
 * Build the invite email HTML. ONE primary CTA (the prefilled survey link), an
 * open-tracking pixel, and a real unsubscribe link (CAN-SPAM / consent hygiene).
 * The CTA can carry a prefilled intent so the recipient lands one question deep.
 */
export function buildInviteEmail(params: {
  userId: string;
  name: string | null;
  intent?: IntentValue;
  batch?: string;
}): { subject: string; html: string } {
  const url = surveyUrl(params.intent);
  const unsubToken = signToken(params.userId, SURVEY_INVITE_EMAIL_TYPE);
  const unsubUrl = `${SITE_URL}/unsubscribe/${unsubToken}`;
  const pixelUrl = `${SITE_URL}/api/survey-pixel${params.batch ? `?b=${encodeURIComponent(params.batch)}` : ""}`;
  const greeting = params.name ? `Hi ${params.name},` : "Hi,";

  const subject = "Quick question — 30 seconds to shape ReviewIQ?";
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0;">ReviewIQ</h1>
  </div>
  <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <p style="color:#111827;font-size:15px;margin:0 0 12px;">${greeting}</p>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 16px;">
      You've used ReviewIQ, so your view counts. We're shaping what we build next and
      have <b>3 quick questions</b> — it takes under 30 seconds and needs no account.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Answer 3 quick questions</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:16px 0 0;">
      We want to know why you visit, what gets in your way, and whether account
      features would be useful. Honest answers — including "not useful" — help most.
    </p>
  </div>
  <div style="text-align:center;margin-top:24px;padding-top:16px;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
    </p>
    <p style="color:#d1d5db;font-size:11px;margin-top:8px;">ReviewIQ &mdash; Real Reviews, Real Intelligence</p>
  </div>
</div>
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />
</body></html>`;

  return { subject, html };
}

export interface SendResult {
  attempted: number;
  sent: number;
  failed: number;
  skippedNoResend: boolean;
  recipients: Array<{ userId: string; email: string; ok: boolean }>;
}

/**
 * Staged, consent-gated send of the survey invite (DAN-984).
 *
 * Safety model:
 *   - `dryRun: true` (DEFAULT) resolves the audience and renders emails but sends
 *     NOTHING and writes NOTHING. Use it to verify audience size and content.
 *   - A real send requires `dryRun: false` AND a configured RESEND_API_KEY.
 *   - Every successful send is logged to EmailLog (dedup) and emits ONE
 *     `email_sent` funnel row (the completion-rate denominator). Re-runs never
 *     double-send the same user (EmailLog gate in the audience query).
 *
 * Batch-1 guardrail: pass `limit` ~150-200 for the first batch; report its
 * completion rate before widening to the full eligible list.
 */
export async function sendSurveyInvites(opts: {
  dryRun?: boolean;
  limit?: number;
  batch?: string;
  reviewersOnly?: boolean;
  prefillIntentForAll?: IntentValue;
} = {}): Promise<SendResult> {
  const dryRun = opts.dryRun ?? true;
  const audienceOpts: AudienceOptions = {
    reviewersOnly: opts.reviewersOnly,
    limit: opts.limit ?? 200,
  };
  const recipients = await getEligibleRecipients(audienceOpts);

  const result: SendResult = {
    attempted: recipients.length,
    sent: 0,
    failed: 0,
    skippedNoResend: false,
    recipients: [],
  };

  if (dryRun) {
    result.recipients = recipients.map((r) => ({ userId: r.userId, email: r.email, ok: false }));
    return result;
  }

  const resend = getResend();
  if (!resend) {
    result.skippedNoResend = true;
    return result;
  }

  for (const r of recipients) {
    const ok = await sendOne(resend, r, opts.batch, opts.prefillIntentForAll);
    if (ok) result.sent++;
    else result.failed++;
    result.recipients.push({ userId: r.userId, email: r.email, ok });
  }
  return result;
}

async function sendOne(
  resend: Resend,
  r: Recipient,
  batch?: string,
  intent?: IntentValue
): Promise<boolean> {
  const { subject, html } = buildInviteEmail({
    userId: r.userId,
    name: r.name,
    intent,
    batch,
  });
  try {
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to: r.email, subject, html });
    if (error) return false;

    // Record dedup + funnel only on a confirmed send.
    await prisma.emailLog.create({
      data: { userId: r.userId, emailType: SURVEY_INVITE_EMAIL_TYPE },
    });
    await prisma.smartreviewSurvey.create({
      data: {
        event: EmailFunnelEvent.Sent,
        reachedStep: EmailFunnelStep.Sent,
        referralSource: EMAIL_CHANNEL,
        actionType: batch ? `batch:${batch}` : null,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// Re-export so callers (scripts/routes) have one import surface.
export { INTENT_OPTIONS };
