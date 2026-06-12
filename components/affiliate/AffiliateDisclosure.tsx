"use client";

import Link from "next/link";
import {
  AFFILIATE_DISCLOSURE_TEXT,
  METHODOLOGY_LINK,
  METHODOLOGY_LINK_LABEL,
} from "@/lib/affiliate";
import {
  trackDisclosureMethodologyOpen,
  type DisclosureMethodologySource,
} from "@/lib/analytics";

interface AffiliateDisclosureProps {
  /**
   * Where this disclosure is rendered, used as the analytics `source`.
   * Defaults to `panel_footnote` — its primary home under WhereToBuyPanel.
   */
  source?: DisclosureMethodologySource;
  className?: string;
}

/**
 * Tier 1 of the 3-tier affiliate disclosure (DAN-973 2a, DAN-600 Component 2).
 *
 * An always-present, plain-English footnote rendered alongside affiliate links
 * (e.g. under WhereToBuyPanel). Wrapped in a labelled `<aside>` so screen-reader
 * users can jump to/from it (a11y, DAN-600 Component 5). The "see how we work →"
 * link deep-links to the methodology page and fires `disclosure_methodology_open`.
 */
export function AffiliateDisclosure({
  source = "panel_footnote",
  className = "",
}: AffiliateDisclosureProps) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      className={`flex items-start gap-2 text-xs leading-relaxed text-gray-500 ${className}`.trim()}
    >
      <span aria-hidden="true" className="mt-px shrink-0 font-medium">
        ⓘ
      </span>
      <p>
        {AFFILIATE_DISCLOSURE_TEXT}{" "}
        <Link
          href={METHODOLOGY_LINK}
          onClick={() => trackDisclosureMethodologyOpen(source)}
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {METHODOLOGY_LINK_LABEL}
        </Link>
      </p>
    </aside>
  );
}
