import { createHash } from "crypto";

// EU/EEA country codes (ISO 3166-1 alpha-2)
const EU_EEA_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EEA (non-EU)
  "IS", "LI", "NO",
  // UK GDPR
  "GB",
]);

export interface ConsentCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface GoogleConsentModeV2 {
  ad_storage: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
}

export const CURRENT_POLICY_VERSION = "1.0";

export function isEuEea(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return EU_EEA_COUNTRIES.has(countryCode.toUpperCase());
}

export function getCountryFromHeaders(headers: Headers): string | null {
  return headers.get("x-vercel-ip-country") || null;
}

export function hashIp(ip: string): string {
  const salt = process.env.CONSENT_IP_SALT || "";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}

export const CONSENT_RETENTION_YEARS = 3;

export function toGoogleConsentMode(categories: ConsentCategories): GoogleConsentModeV2 {
  return {
    ad_storage: categories.marketing ? "granted" : "denied",
    analytics_storage: categories.analytics ? "granted" : "denied",
    ad_user_data: categories.marketing ? "granted" : "denied",
    ad_personalization: categories.marketing ? "granted" : "denied",
  };
}

export function defaultConsentForRegion(isEu: boolean): ConsentCategories {
  return {
    necessary: true,
    analytics: !isEu,
    marketing: !isEu,
    functional: !isEu,
  };
}
