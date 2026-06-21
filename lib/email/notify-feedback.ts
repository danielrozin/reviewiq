import { Resend } from "resend";

// The Resend account owner / founder. This is the only address the sandbox
// sender (onboarding@resend.dev) is allowed to deliver to until a domain is
// verified, so the fallback path sends here exclusively. It is also the address
// the founder explicitly needs notified (DAN-323).
const OWNER_EMAIL = "daniarozin@gmail.com";
const NOTIFY_EMAILS = [OWNER_EMAIL, "Shai.and1@gmail.com"];

let _resend: Resend | null = null;
function getResend(): Resend | null {
  // Trim to survive a secret stored with stray whitespace/newline (see fromEmail
  // note below — the same class of bug that silently broke delivery in DAN-1276).
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return null;
  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}

/**
 * Send an admin notification to the ReviewIQ owners.
 *
 * Returns `true` only when Resend actually accepted the message — never a silent
 * `true`. Every outcome is logged (`[EMAIL][resend][ok|fail]` / `[EMAIL][skip]`)
 * so a missing key or a send failure is visible in the Vercel function logs
 * instead of vanishing (DAN-1276 / DAN-323 founder bug: 120 days of zero
 * notifications because the path failed silently).
 *
 * Callers MUST `await` this. It is intentionally not fire-and-forget: on Vercel
 * serverless the function instance can freeze the moment the route returns its
 * response, killing an un-awaited Resend HTTP request before it flushes.
 */
// Resend's universally-available sandbox sender. It requires no domain
// verification and reliably delivers to the Resend account owner's own
// address — which is exactly who our admin notifications go to
// (daniarozin@gmail.com). Used as the guaranteed-deliverable fallback when the
// branded From domain isn't (yet) verified.
const SANDBOX_FROM = "onboarding@resend.dev";

async function trySend(
  resend: Resend,
  from: string,
  to: string[],
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    if (error) {
      console.error(`[EMAIL][resend][fail] from=${from} to=${to.join(",")} ${subject}:`, error);
      return false;
    }
    console.log(`[EMAIL][resend][ok] from=${from} to=${to.join(",")} ${subject} (id=${data?.id ?? "?"})`);
    return true;
  } catch (err) {
    console.error(`[EMAIL][resend][fail] from=${from} to=${to.join(",")} ${subject}:`, err);
    return false;
  }
}

async function sendAdminNotification(subject: string, html: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn(`[EMAIL][skip] RESEND_API_KEY not set — dropped admin notification: ${subject}`);
    return false;
  }

  // Trim the env value: the Vercel prod secret was stored with a trailing
  // newline ("Info@revieweriq.com\n"), which corrupts the From header and makes
  // Resend silently reject every send (DAN-1276 root cause). Defensive trim so a
  // stray whitespace in the secret can never break delivery again.
  const fromEmail =
    (process.env.RESEND_FROM_EMAIL || "").trim() || SANDBOX_FROM;

  // Primary attempt: configured (branded) sender → all owners. This works once
  // revieweriq.com is verified in Resend.
  if (await trySend(resend, fromEmail, NOTIFY_EMAILS, subject, html)) return true;

  // Fallback: the branded send failed. The cause (confirmed in DAN-1276 via a
  // live probe with the prod key) is that revieweriq.com is NOT a verified
  // Resend domain, so the branded From 400s. Retry with the sandbox sender,
  // which needs no domain — but Resend only lets the sandbox sender deliver to
  // the account owner's own address, so we send to OWNER_EMAIL ONLY here
  // (including the second recipient would 403 the whole call and drop the
  // notification entirely). The founder (DAN-323) gets notified today; once the
  // domain is verified the primary attempt succeeds and reaches all owners.
  if (fromEmail !== SANDBOX_FROM) {
    console.warn(
      `[EMAIL][fallback] retrying "${subject}" via ${SANDBOX_FROM} → ${OWNER_EMAIL} only (branded ${fromEmail} failed; verify revieweriq.com in Resend to reach all recipients)`,
    );
    return trySend(resend, SANDBOX_FROM, [OWNER_EMAIL], subject, html);
  }

  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface SurveyData {
  q1Intent?: string | null;
  q2Found?: boolean | null;
  q2Missing?: string | null;
  q3Rating?: number | null;
  q4Improvement?: string | null;
  q5Discovery?: string | null;
  deviceType?: string | null;
  referralSource?: string | null;
}

export async function notifyNewFeedback(survey: SurveyData): Promise<boolean> {
  const lines: string[] = [];

  if (survey.q1Intent) lines.push(`<b>Intent:</b> ${escapeHtml(survey.q1Intent)}`);
  if (survey.q2Found !== null && survey.q2Found !== undefined)
    lines.push(`<b>Found what they needed:</b> ${survey.q2Found ? "Yes" : "No"}`);
  if (survey.q2Missing) lines.push(`<b>What was missing:</b> ${escapeHtml(survey.q2Missing)}`);
  if (survey.q3Rating) lines.push(`<b>Rating:</b> ${"★".repeat(survey.q3Rating)}${"☆".repeat(5 - survey.q3Rating)} (${survey.q3Rating}/5)`);
  if (survey.q4Improvement) lines.push(`<b>Improvement suggestion:</b> ${escapeHtml(survey.q4Improvement)}`);
  if (survey.q5Discovery) lines.push(`<b>Discovery source:</b> ${escapeHtml(survey.q5Discovery)}`);
  if (survey.deviceType) lines.push(`<b>Device:</b> ${escapeHtml(survey.deviceType)}`);
  if (survey.referralSource) lines.push(`<b>Referrer:</b> ${escapeHtml(survey.referralSource)}`);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; margin-bottom: 16px;">New feedback from ReviewIQ</h2>
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        ${lines.map((l) => `<p style="margin: 8px 0; color: #374151; font-size: 14px;">${l}</p>`).join("")}
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Sent automatically by ReviewIQ survey system</p>
    </div>
  `;

  return sendAdminNotification("New feedback from reviewiq", html);
}

interface SubscriberData {
  email: string;
  productName?: string | null;
  productSlug?: string | null;
  source?: string | null;
  reSubscribe?: boolean;
}

/**
 * Notify the ReviewIQ owners when someone subscribes to email alerts / the
 * newsletter (DAN-1276 / DAN-323). The subscribe route previously saved the row
 * but sent no admin notification at all, so the founder never learned about new
 * signups.
 */
export async function notifyNewSubscriber(sub: SubscriberData): Promise<boolean> {
  const lines: string[] = [];
  lines.push(`<b>Email:</b> ${escapeHtml(sub.email)}`);
  if (sub.productName) lines.push(`<b>Product:</b> ${escapeHtml(sub.productName)}`);
  if (sub.source) lines.push(`<b>Opt-in source:</b> ${escapeHtml(sub.source)}`);
  if (sub.reSubscribe) lines.push(`<b>Note:</b> re-subscribed (previously unsubscribed)`);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a; margin-bottom: 16px;">New email subscriber on ReviewIQ</h2>
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb;">
        ${lines.map((l) => `<p style="margin: 8px 0; color: #374151; font-size: 14px;">${l}</p>`).join("")}
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Sent automatically by ReviewIQ subscription system</p>
    </div>
  `;

  return sendAdminNotification(`New ReviewIQ subscriber: ${sub.email}`, html);
}
