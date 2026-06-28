import { buildMetadata } from "@/lib/seo/metadata";
import { AcceptableUseContent } from "./AcceptableUseContent";

export const metadata = buildMetadata({
  title: "Acceptable Use Policy",
  description: "Read the ReviewIQ Acceptable Use Policy. Understand the rules for using our platform responsibly.",
  path: "/acceptable-use",
});

export default function AcceptableUsePage() {
  return <AcceptableUseContent />;
}
