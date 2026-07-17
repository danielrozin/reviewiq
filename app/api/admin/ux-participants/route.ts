import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const participants = await prisma.uxParticipant.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ participants });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const body = await request.json();
  const { name, email, available, device, notes } = body;

  if (!name || !email || !available || !device) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const participant = await prisma.uxParticipant.create({
      data: { name, email, available, device, notes },
    });
    return NextResponse.json({ participant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
}
