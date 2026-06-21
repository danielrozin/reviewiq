import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  SUBSCRIPTION_SOURCE,
  SUBSCRIPTION_SOURCE_VALUES,
} from "@/lib/email/newsletter";
import { notifyNewSubscriber } from "@/lib/email/notify-feedback";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  // Consent-basis source (DAN-1085). Optional; defaults to the per-product alert
  // opt-in so existing callers (EmailCaptureCTA) are unchanged.
  source: z
    .enum(SUBSCRIPTION_SOURCE_VALUES)
    .optional()
    .default(SUBSCRIPTION_SOURCE.PRODUCT_ALERT),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, productId, productSlug, productName, source } = parsed.data;

    const existing = await prisma.emailSubscription.findUnique({
      where: { email_productId: { email, productId } },
    });

    if (existing && !existing.unsubscribedAt) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    if (existing && existing.unsubscribedAt) {
      // Re-opt-in: clear the unsubscribe and re-stamp the consent source to the
      // surface that re-subscribed them (createdAt keeps the original opt-in date).
      await prisma.emailSubscription.update({
        where: { id: existing.id },
        data: { unsubscribedAt: null, source },
      });
      // Awaited admin notification (DAN-1276): never let a serverless freeze
      // drop the send; a notify failure must not fail the subscription.
      try {
        await notifyNewSubscriber({ email, productName, productSlug, source, reSubscribe: true });
      } catch (err) {
        console.error("[EMAIL][subscribe] re-subscribe notification threw:", err);
      }
      return NextResponse.json({ success: true });
    }

    await prisma.emailSubscription.create({
      data: { email, productId, productSlug, productName, source },
    });

    try {
      await notifyNewSubscriber({ email, productName, productSlug, source });
    } catch (err) {
      console.error("[EMAIL][subscribe] new-subscriber notification threw:", err);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
