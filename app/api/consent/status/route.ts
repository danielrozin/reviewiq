import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  defaultConsentForRegion,
  getCountryFromHeaders,
  isEuEea,
  toGoogleConsentMode,
} from "@/lib/consent";

export async function GET(request: NextRequest) {
  try {
    const visitorId = request.nextUrl.searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitorId query parameter is required" },
        { status: 400 }
      );
    }

    const geoCountry = getCountryFromHeaders(request.headers);
    const isEu = isEuEea(geoCountry);

    const latestConsent = await prisma.consentRecord.findFirst({
      where: {
        visitorId,
        revokedAt: null,
      },
      orderBy: { grantedAt: "desc" },
    });

    if (!latestConsent) {
      const defaults = defaultConsentForRegion(isEu);
      return NextResponse.json({
        hasConsented: false,
        isEuEea: isEu,
        geoCountry,
        categories: defaults,
        consentMode: toGoogleConsentMode(defaults),
      });
    }

    const categories = latestConsent.consentCategories as {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
      functional: boolean;
    };

    return NextResponse.json({
      hasConsented: true,
      isEuEea: isEu,
      geoCountry,
      categories,
      consentMode: toGoogleConsentMode(categories),
      policyVersion: latestConsent.policyVersion,
      grantedAt: latestConsent.grantedAt,
    });
  } catch (error) {
    console.error("Consent status error:", error);
    return NextResponse.json(
      { error: "Failed to get consent status" },
      { status: 500 }
    );
  }
}
