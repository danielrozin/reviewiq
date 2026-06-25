import { buildMetadata } from "@/lib/seo/metadata";

// The /compare page is a client component (interactive multi-product builder),
// so it cannot export metadata itself. This layout supplies a proper SEO
// title, description, and canonical for the comparison hub — previously it
// inherited the generic root title.
export const metadata = buildMetadata({
  title: "Compare Products Side-by-Side — SmartScores, Specs & Real Reviews",
  description:
    "Build your own head-to-head comparison. Stack any products side-by-side on SmartScore, specs, and verified buyer reviews to decide faster. Start comparing free.",
  path: "/compare",
});

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
