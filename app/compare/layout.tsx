import { buildMetadata } from "@/lib/seo/metadata";

// The /compare page is a client component (interactive multi-product builder),
// so it cannot export metadata itself. This layout supplies a proper SEO
// title, description, and canonical for the comparison hub — previously it
// inherited the generic root title.
//
// NOTE: this layout also wraps every /compare/[slug] comparison detail page.
// The hub CollectionPage + ItemList JSON-LD therefore must NOT live here — it
// would leak the full list of all comparison pairs onto each detail money page,
// diluting that page's primary-entity signal. The hub schema is emitted only by
// the index route (app/compare/page.tsx). Detail pages override this metadata
// via their own generateMetadata (canonical stays correct).
export const metadata = buildMetadata({
  title: "Compare Products Side-by-Side — Specs & Reviews",
  description:
    "Build your own head-to-head comparison. Stack any products side-by-side on SmartScore, specs, and verified buyer reviews to decide faster. Start comparing free.",
  path: "/compare",
});

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
