import { CookiePolicyContent } from "./CookiePolicyContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "Learn how ReviewIQ uses cookies and similar tracking technologies, and how to control them.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return <CookiePolicyContent />;
}
