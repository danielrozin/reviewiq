import { buildMetadata } from "@/lib/seo/metadata";
import { WriteReviewForm } from "./WriteReviewForm";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "Write a Product Review — Share Your Experience | ReviewIQ",
  description:
    "Write an honest, verified product review on ReviewIQ. Help thousands of buyers make smarter decisions. Free, takes under 3 minutes.",
  path: "/write-review",
});

export default function WriteReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Write a Review", url: "/write-review" }])),
        }}
      />
      <WriteReviewForm />
    </>
  );
}
