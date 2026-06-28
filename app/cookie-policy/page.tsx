import { buildMetadata } from "@/lib/seo/metadata";
import { CookiePolicyContent } from "./CookiePolicyContent";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Learn how ReviewIQ uses cookies and similar tracking technologies.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return <CookiePolicyContent />;
}
