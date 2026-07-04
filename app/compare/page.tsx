import { buildMetadata } from "@/lib/seo/metadata";
import { CompareBuilder } from "./CompareBuilder";

export const metadata = buildMetadata({
  title: "Compare Products Side-by-Side — Up to 4 Products | ReviewIQ",
  description:
    "Search and add 2–4 products to compare SmartScores, specs, pros & cons, and get an AI verdict in one view. Free, no sign-in needed.",
  path: "/compare",
});

export default function ComparePage() {
  return <CompareBuilder />;
}
