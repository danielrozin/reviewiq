import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function notifyAdmin(name: string, email: string, available: string, device: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "A Versus B <hello@aversusb-mail.com>";
  const to = process.env.RESEND_REPLY_TO ?? "daniarozin@gmail.com";
  if (!apiKey) return;

  const subject = `New UX study signup: ${name}`;
  const text = `New participant signed up for the ReviewIQ UX study.\n\nName: ${name}\nEmail: ${email}\nAvailable: ${available}\nDevice: ${device}\n\nManage at https://www.revieweriq.com/admin/ux-participants`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: to, subject, text }),
    });
  } catch {
    // non-critical — signup still succeeds if notification fails
  }
}

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
    // fire-and-forget admin notification
    void notifyAdmin(name.trim(), email.toLowerCase().trim(), available, device);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "You are already registered" }, { status: 409 });
  }
}
