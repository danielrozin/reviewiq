import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETENTION_YEARS = 3;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - RETENTION_YEARS);

    const result = await prisma.consentRecord.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return NextResponse.json({
      deleted: result.count,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error("Consent cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to clean up consent records" },
      { status: 500 }
    );
  }
}
