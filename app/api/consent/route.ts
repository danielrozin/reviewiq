import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  CURRENT_POLICY_VERSION,
  getCountryFromHeaders,
  hashIp,
  toGoogleConsentMode,
} from "@/lib/consent";

const consentSchema = z.object({
  visitorId: z.string().min(1),
  categories: z.object({
    necessary: z.literal(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
    functional: z.boolean(),
  }),
  policyVersion: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = consentSchema.parse(json);

    const geoCountry = getCountryFromHeaders(request.headers);
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim();
    const ipHash = ip ? hashIp(ip) : null;
    const userAgent = request.headers.get("user-agent");

    const record = await prisma.consentRecord.create({
      data: {
        visitorId: data.visitorId,
        consentCategories: data.categories,
        ipHash,
        policyVersion: data.policyVersion || CURRENT_POLICY_VERSION,
        userAgent,
        geoCountry,
      },
    });

    const consentMode = toGoogleConsentMode(data.categories);

    return NextResponse.json({
      id: record.id,
      consentMode,
      policyVersion: record.policyVersion,
      grantedAt: record.grantedAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid consent data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Consent record error:", error);
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }
}
