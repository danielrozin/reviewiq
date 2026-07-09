import { buildMetadata } from "@/lib/seo/metadata";
import { comparisonHubSchema } from "@/lib/schema/jsonld";
import { getAllComparisonPairs } from "@/data/comparisons";

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
  const hubSchema = comparisonHubSchema(getAllComparisonPairs());
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
      {children}
    </>
  );
}
