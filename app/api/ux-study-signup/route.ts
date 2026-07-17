import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, available, device } = body;

  if (!name || !email || !available || !device) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const validAvailable = ["mornings", "evenings", "weekends"];
  const validDevice = ["mobile", "desktop", "both"];
  if (!validAvailable.includes(available) || !validDevice.includes(device)) {
    return NextResponse.json({ error: "Invalid field values" }, { status: 400 });
  }

  try {
    await prisma.uxParticipant.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), available, device },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "You are already registered" }, { status: 409 });
  }
}
