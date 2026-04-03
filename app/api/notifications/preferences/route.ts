import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  priceAlerts: z.boolean().optional(),
  reviewAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const pref = await prisma.notificationPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return NextResponse.json({
    priceAlerts: pref.priceAlerts,
    reviewAlerts: pref.reviewAlerts,
    weeklyDigest: pref.weeklyDigest,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const pref = await prisma.notificationPreference.upsert({
    where: { userId },
    update: parsed.data,
    create: { userId, ...parsed.data },
  });

  return NextResponse.json({
    priceAlerts: pref.priceAlerts,
    reviewAlerts: pref.reviewAlerts,
    weeklyDigest: pref.weeklyDigest,
  });
}
