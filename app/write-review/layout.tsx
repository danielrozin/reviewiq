import { buildMetadata } from "@/lib/seo/metadata";

// The /write-review page is a client component (interactive multi-step review
// form), so it cannot export metadata itself. This layout supplies a proper SEO
// title, description, and canonical for the review-submission page — previously
// it inherited only the generic root title/description with no canonical, even
// though the page is public and listed in the sitemap (priority 0.7).
export const metadata = buildMetadata({
  title: "Write a Product Review — Rate & Share Your Experience",
  description:
    "Share your honest product experience to help others buy smarter. Rate reliability, ease of use, and value in minutes. Write your review free.",
  path: "/write-review",
});

export default function WriteReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
