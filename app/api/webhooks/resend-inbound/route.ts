import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Resend uses Svix under the hood for webhook signature verification.
// The signing secret comes from the Resend dashboard webhook settings.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

// Parse "Display Name <email@domain.com>" or plain "email@domain.com"
function parseAddress(address: string): { email: string; name?: string } {
  const match = address.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { email: address.trim() };
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook signature headers" }, { status: 400 });
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const resend = getResend();
  let event: { type: string; data: Record<string, unknown> };

  try {
    const verified = resend.webhooks.verify({
      payload: body,
      webhookSecret,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
    });
    event = verified as unknown as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    // Acknowledge non-inbound events without processing
    return NextResponse.json({ received: true });
  }

  const data = event.data as {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    subject: string;
    message_id: string;
  };

  const emailId = data.email_id;

  // Fetch full email body + headers from Resend API
  let bodyText: string | null = null;
  let bodyHtml: string | null = null;
  let rawHeaders: Record<string, string> | null = null;
  let inReplyTo: string | null = null;
  let messageId: string | null = data.message_id ?? null;

  try {
    const { data: full, error } = await resend.emails.receiving.get(emailId);
    if (full && !error) {
      bodyText = full.text ?? null;
      bodyHtml = full.html ?? null;
      rawHeaders = full.headers ?? null;
      messageId = full.message_id ?? messageId;
      // In-Reply-To is in the headers map (case-insensitive key)
      if (rawHeaders) {
        const headerKey = Object.keys(rawHeaders).find(
          (k) => k.toLowerCase() === "in-reply-to"
        );
        if (headerKey) inReplyTo = rawHeaders[headerKey];
      }
    }
  } catch (err) {
    // Non-fatal: store what we have from the webhook payload
    console.warn("Failed to fetch full inbound email body:", err);
  }

  const from = parseAddress(data.from);
  const toEmail = Array.isArray(data.to) && data.to.length > 0 ? data.to[0] : "";

  try {
    await prisma.outreachReply.upsert({
      where: { resendEmailId: emailId },
      create: {
        resendEmailId: emailId,
        messageId,
        inReplyTo,
        fromEmail: from.email,
        fromName: from.name ?? null,
        toEmail,
        subject: data.subject ?? "(no subject)",
        bodyText,
        bodyHtml,
        rawHeaders: rawHeaders ?? undefined,
      },
      update: {
        // Idempotent: only fill in missing body/headers on re-delivery
        bodyText: bodyText ?? undefined,
        bodyHtml: bodyHtml ?? undefined,
        rawHeaders: rawHeaders ?? undefined,
        inReplyTo: inReplyTo ?? undefined,
      },
    });
  } catch (err) {
    console.error("Failed to persist inbound reply:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
