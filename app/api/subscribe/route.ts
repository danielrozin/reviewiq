import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
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

    const { email, productId, productSlug, productName } = parsed.data;

    const existing = await prisma.emailSubscription.findUnique({
      where: { email_productId: { email, productId } },
    });

    if (existing && !existing.unsubscribedAt) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    if (existing && existing.unsubscribedAt) {
      await prisma.emailSubscription.update({
        where: { id: existing.id },
        data: { unsubscribedAt: null },
      });
      return NextResponse.json({ success: true });
    }

    await prisma.emailSubscription.create({
      data: { email, productId, productSlug, productName },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
