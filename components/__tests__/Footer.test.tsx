import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { METHODOLOGY_LINK } from "@/lib/affiliate";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  trackDisclosureMethodologyOpen: vi.fn(),
}));

/**
 * The affiliate + AI disclosure page used to be a near-orphan: its only in-app
 * link lived in the WhereToBuyPanel footnote, which renders only for products
 * with live offers, so in practice /site-map was the sole path to it. These
 * tests pin the footer as an offer-independent route to it (FTC 16 CFR 255 +
 * E-E-A-T), so the page can't silently fall out of the link graph again.
 */
describe("Footer — affiliate & AI disclosure reachability", () => {
  const linksTo = (href: string) =>
    screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith(href));

  it("links to the disclosure page from the Legal column", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /affiliate & ai disclosure/i })
    ).toHaveAttribute("href", "/how-we-work");
  });

  it("renders the disclosure footnote deep-linking to the affiliate section", () => {
    render(<Footer />);

    expect(
      screen.getByRole("complementary", { name: "Affiliate disclosure" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/may earn a commission on purchases made through/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /see how we work/i })
    ).toHaveAttribute("href", METHODOLOGY_LINK);
  });

  it("reaches the disclosure page without depending on live offers", () => {
    // The footnote and the Legal link are both rendered by the Footer itself —
    // no product, offer, or WhereToBuyPanel is involved in this render.
    render(<Footer />);
    expect(linksTo("/how-we-work").length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the disclosure label distinct from Platform's How It Works", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /^how it works$/i })
    ).toHaveAttribute("href", "/how-it-works");
    expect(
      screen.queryByRole("link", { name: /^how we work$/i })
    ).not.toBeInTheDocument();
  });
});
