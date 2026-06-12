/**
 * Shared affiliate-disclosure constants (DAN-973, DAN-600 Component 2).
 *
 * Per the H1 Option C decision (DAN-413), ReviewIQ earns affiliate commissions
 * on outbound retailer links. FTC 16 CFR Part 255 requires a clear, conspicuous
 * disclosure wherever those links appear, plus machine-readable `rel` attributes
 * on every affiliate `<a>`. These constants are the single source of truth so the
 * same copy/attributes can be reused across WhereToBuyPanel, deal-alert UX, and
 * price-drop emails.
 */

/**
 * Canonical destination for the "see how we work →" disclosure link.
 * Deep-links to the affiliate section of the methodology page (DAN-972).
 */
export const METHODOLOGY_LINK = "/how-we-work#affiliate-relationships";

/**
 * `rel` value every affiliate `<a>` must carry:
 * - `sponsored` flags the link as paid/affiliate to search engines (FTC + Google).
 * - `nofollow` keeps it out of link-equity flow.
 * - `noopener` prevents the opened tab from accessing `window.opener` (security).
 */
export const AFFILIATE_REL = "sponsored noopener nofollow";

/** Plain-English disclosure sentence shown in the footnote (no legalese). */
export const AFFILIATE_DISCLOSURE_TEXT =
  "ReviewIQ may earn a commission on purchases made through these links. This does not influence our SmartScores or rankings —";

/** Visible label for the methodology link. */
export const METHODOLOGY_LINK_LABEL = "see how we work →";
