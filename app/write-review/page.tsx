import { buildMetadata } from "@/lib/seo/metadata";
import { WriteReviewForm } from "./WriteReviewForm";

export const metadata = buildMetadata({
  title: "Write a Product Review — Share Your Experience | ReviewIQ",
  description:
    "Write an honest, verified product review on ReviewIQ. Help thousands of buyers make smarter decisions. Free, takes under 3 minutes.",
  path: "/write-review",
});

export default function WriteReviewPage() {
  return <WriteReviewForm />;
}
