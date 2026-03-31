import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { toGoogleConsentMode } from "@/lib/consent";
import type { ConsentCategories } from "@/lib/consent";

const revokeSchema = z.object({
  visitorId: z.string().min(1),
  categories: z.array(z.enum(["analytics", "marketing", "functional"])).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = revokeSchema.parse(json);

    const latestConsent = await prisma.consentRecord.findFirst({
      where: {
        visitorId: data.visitorId,
        revokedAt: null,
      },
      orderBy: { grantedAt: "desc" },
    });

    if (!latestConsent) {
      return NextResponse.json(
        { error: "No active consent found for this visitor" },
        { status: 404 }
      );
    }

    const currentCategories = latestConsent.consentCategories as unknown as ConsentCategories;

    // Revoke the old consent record
    await prisma.consentRecord.update({
      where: { id: latestConsent.id },
      data: { revokedAt: new Date() },
    });

    // Create new record with revoked categories set to false
    const updatedCategories: ConsentCategories = {
      ...currentCategories,
      necessary: true, // always true
    };
    for (const cat of data.categories) {
      updatedCategories[cat] = false;
    }

    const newRecord = await prisma.consentRecord.create({
      data: {
        visitorId: data.visitorId,
        consentCategories: updatedCategories as unknown as Record<string, boolean>,
        ipHash: latestConsent.ipHash,
        policyVersion: latestConsent.policyVersion,
        userAgent: latestConsent.userAgent,
        geoCountry: latestConsent.geoCountry,
      },
    });

    return NextResponse.json({
      id: newRecord.id,
      categories: updatedCategories,
      consentMode: toGoogleConsentMode(updatedCategories),
      revokedCategories: data.categories,
      grantedAt: newRecord.grantedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid revoke data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Consent revoke error:", error);
    return NextResponse.json(
      { error: "Failed to revoke consent" },
      { status: 500 }
    );
  }
}
