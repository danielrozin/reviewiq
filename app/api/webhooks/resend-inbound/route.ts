import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import {
  isInboundEmailEvent,
  parseResendInboundEvent,
  inboundDedupeKey,
} from "@/lib/email/inbound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/resend-inbound
 *
 * Receives inbound-email webhooks from Resend (replies to Info@revieweriq.com),
 * verifies the Svix signature, and persists each reply as an OutreachReply so
 * BD agents can read outreach responses without a full-access dashboard key.
 *
 * Configure in Resend: Webhooks → add endpoint pointing at this URL, subscribe
 * to the inbound/received email event, and set RESEND_INBOUND_WEBHOOK_SECRET to
 * the signing secret (whsec_...).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_INBOUND_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  let event: unknown;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Acknowledge non-inbound events (deliveries, bounces, etc.) without storing.
  if (!isInboundEmailEvent(event)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const parsed = parseResendInboundEvent(event);
    if (!parsed.fromEmail) {
      // Malformed inbound payload — ack so Resend stops retrying, but log it.
      console.error("Resend inbound webhook: event had no sender", { svixId });
      return NextResponse.json({ received: true, skipped: "no_sender" });
    }

    const dedupeKey = inboundDedupeKey(parsed, svixId);
    const data = {
      dedupeKey,
      resendEventId: svixId,
      eventType: parsed.eventType,
      fromEmail: parsed.fromEmail,
      fromName: parsed.fromName,
      toEmail: parsed.toEmail,
      subject: parsed.subject,
      bodyText: parsed.bodyText,
      bodyHtml: parsed.bodyHtml,
      messageId: parsed.messageId,
      inReplyTo: parsed.inReplyTo,
      references: parsed.references,
      headers: parsed.headers,
      raw: event as object,
      receivedAt: parsed.receivedAt,
    };

    const reply = await prisma.outreachReply.upsert({
      where: { dedupeKey },
      create: data,
      // Re-delivery of the same message is idempotent; keep the stored copy.
      update: { resendEventId: svixId, eventType: parsed.eventType },
    });

    return NextResponse.json({ received: true, id: reply.id });
  } catch (err) {
    console.error("Resend inbound webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
