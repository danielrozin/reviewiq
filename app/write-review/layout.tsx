import { buildMetadata } from "@/lib/seo/metadata";
import { writeReviewPageSchema } from "@/lib/schema/jsonld";

// The /write-review page is a client component (interactive multi-step review
// form), so it cannot export metadata itself. This layout supplies a proper SEO
// title, description, and canonical for the review-submission page — previously
// it inherited only the generic root title/description with no canonical, even
// though the page is public and listed in the sitemap (priority 0.7).
export const metadata = buildMetadata({
  title: "Write a Product Review — Share Your Experience",
  description:
    "Share your honest product experience to help others buy smarter. Rate reliability, ease of use, and value in minutes. Write your review free.",
  path: "/write-review",
});

export default function WriteReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Emitted from the layout for the same reason the metadata is: page.tsx is a
  // client component. /write-review is a leaf route — this layout wraps exactly
  // one page, so the node cannot leak onto a sibling. If a child segment is ever
  // added under /write-review, move this into an index-route-scoped component
  // first (see the /compare hub leak: hub schema in a shared segment layout
  // lands on every detail page).
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(writeReviewPageSchema()),
        }}
      />
      {children}
    </>
  );
}
