import { buildMetadata } from "@/lib/seo/metadata";
import { PrivacyContent } from "./PrivacyContent";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read the ReviewIQ Privacy Policy to understand how we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
