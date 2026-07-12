import { TermsContent } from "./TermsContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Read the ReviewIQ Terms of Service. Understand your rights and responsibilities as a user.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsContent />;
}
