import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Queryable view over captured outreach replies.
 *
 * Auth (either is accepted):
 *  - Bearer token equal to OUTREACH_API_SECRET (falls back to CRON_SECRET).
 *    This is the agent-facing path: BD agents query replies with a token, no
 *    dashboard login required.
 *  - The admin dashboard cookie (verifyAdmin).
 */
function authorize(request: NextRequest): boolean {
  if (verifyAdmin(request)) return true;
  const expected = process.env.OUTREACH_API_SECRET || process.env.CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${expected}`;
}

/**
 * GET /api/outreach/replies
 * Query params: page, limit, status, from, q (search subject/body/sender), since (ISO date).
 */
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const status = searchParams.get("status") || "";
    const from = searchParams.get("from") || "";
    const q = searchParams.get("q") || "";
    const since = searchParams.get("since") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (from) where.fromEmail = { contains: from, mode: "insensitive" };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) where.receivedAt = { gte: sinceDate };
    }
    if (q) {
      where.OR = [
        { subject: { contains: q, mode: "insensitive" } },
        { bodyText: { contains: q, mode: "insensitive" } },
        { fromEmail: { contains: q, mode: "insensitive" } },
        { fromName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [replies, total] = await Promise.all([
      prisma.outreachReply.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fromEmail: true,
          fromName: true,
          toEmail: true,
          subject: true,
          bodyText: true,
          inReplyTo: true,
          status: true,
          receivedAt: true,
        },
      }),
      prisma.outreachReply.count({ where }),
    ]);

    return NextResponse.json({ replies, total, page, limit });
  } catch (error) {
    console.error("Failed to fetch outreach replies:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}

/**
 * PATCH /api/outreach/replies
 * Body: { ids: string[], status: "unread" | "read" | "handled" }
 * Lets BD agents triage replies (mark read/handled) without dashboard access.
 */
export async function PATCH(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids, status } = (await request.json()) as {
      ids?: string[];
      status?: string;
    };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids required" }, { status: 400 });
    }
    const allowed = ["unread", "read", "handled"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await prisma.outreachReply.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Failed to update outreach replies:", error);
    return NextResponse.json({ error: "Failed to update replies" }, { status: 500 });
  }
}
