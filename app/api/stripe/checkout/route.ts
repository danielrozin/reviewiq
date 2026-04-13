import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  if (!PLANS.pro.stripePriceId) {
    return NextResponse.json({ error: "Stripe pricing not configured" }, { status: 503 });
  }

  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      subscription = await prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: {
          userId,
          stripeCustomerId: customerId,
          plan: "free",
          status: "inactive",
        },
      });
    }

    if (subscription?.status === "active" && subscription.plan === "pro") {
      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS.pro.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`,
      metadata: { userId },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
