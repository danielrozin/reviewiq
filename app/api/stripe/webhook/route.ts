import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

function getPeriodFromSub(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item ? new Date(item.current_period_start * 1000) : null,
    end: item ? new Date(item.current_period_end * 1000) : null,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.customer) {
          const sub = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          const period = getPeriodFromSub(sub);
          const customerId = session.customer as string;
          const existing = await prisma.subscription.findUnique({
            where: { stripeCustomerId: customerId },
          });
          if (existing) {
            await prisma.subscription.update({
              where: { stripeCustomerId: customerId },
              data: {
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0]?.price.id,
                status: "active",
                plan: "pro",
                currentPeriodStart: period.start,
                currentPeriodEnd: period.end,
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              },
            });
          } else {
            console.error(`Webhook: no subscription record for customer ${customerId}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const period = getPeriodFromSub(sub);
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: sub.status === "active" ? "active" : sub.status,
            plan: sub.status === "active" ? "pro" : "free",
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: "canceled",
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (customerId) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "past_due" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook processing error for ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
