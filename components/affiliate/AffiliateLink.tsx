import { AFFILIATE_REL } from "@/lib/affiliate";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface AffiliateLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "rel" | "target"> {
  href: string;
  children: ReactNode;
}

/**
 * The only sanctioned way to render an outbound affiliate `<a>` (DAN-973 2b).
 *
 * Always opens in a new tab and always carries
 * `rel="sponsored noopener nofollow"`. Centralising this guarantees every
 * affiliate link in WhereToBuyPanel (and future affiliate-adjacent UX) is
 * FTC- and SEO-compliant — callers cannot accidentally drop the attributes.
 */
export function AffiliateLink({ href, children, ...props }: AffiliateLinkProps) {
  return (
    <a href={href} target="_blank" rel={AFFILIATE_REL} {...props}>
      {children}
    </a>
  );
}
