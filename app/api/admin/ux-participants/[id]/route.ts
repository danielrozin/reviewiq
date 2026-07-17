import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { status, notes, scheduledAt } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    data.status = status;
    if (status === "contacted") data.contactedAt = new Date();
    if (status === "scheduled") data.scheduledAt = scheduledAt ? new Date(scheduledAt) : new Date();
  }
  if (notes !== undefined) data.notes = notes;

  const participant = await prisma.uxParticipant.update({
    where: { id },
    data,
  });

  return NextResponse.json({ participant });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const { id } = await params;
  await prisma.uxParticipant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
