import { PrivacyContent } from "./PrivacyContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the ReviewIQ Privacy Policy to understand how we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
