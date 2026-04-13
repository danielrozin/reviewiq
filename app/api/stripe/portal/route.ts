import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
}
