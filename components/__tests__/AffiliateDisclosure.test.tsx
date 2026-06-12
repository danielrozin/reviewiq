import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";

// --- Mocks ---

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const trackDisclosureMethodologyOpen = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackDisclosureMethodologyOpen: (...args: unknown[]) =>
    trackDisclosureMethodologyOpen(...args),
}));

beforeEach(() => {
  trackDisclosureMethodologyOpen.mockClear();
});

describe("AffiliateDisclosure", () => {
  it("wraps the footnote in an <aside> labelled for screen readers", () => {
    render(<AffiliateDisclosure />);
    const aside = screen.getByRole("complementary", {
      name: "Affiliate disclosure",
    });
    expect(aside).toBeInTheDocument();
  });

  it("states the commission and the does-not-influence-rankings clause", () => {
    render(<AffiliateDisclosure />);
    expect(
      screen.getByText(/may earn a commission on purchases made through/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not influence our SmartScores or rankings/i)
    ).toBeInTheDocument();
  });

  it("links 'see how we work →' to the methodology affiliate section", () => {
    render(<AffiliateDisclosure />);
    const link = screen.getByRole("link", { name: /see how we work/i });
    expect(link).toHaveAttribute("href", "/how-we-work#affiliate-relationships");
  });

  it("fires disclosure_methodology_open with the default panel_footnote source", () => {
    render(<AffiliateDisclosure />);
    fireEvent.click(screen.getByRole("link", { name: /see how we work/i }));
    expect(trackDisclosureMethodologyOpen).toHaveBeenCalledWith("panel_footnote");
  });

  it("forwards an explicit source to the analytics event", () => {
    render(<AffiliateDisclosure source="how-we-work-link" />);
    fireEvent.click(screen.getByRole("link", { name: /see how we work/i }));
    expect(trackDisclosureMethodologyOpen).toHaveBeenCalledWith(
      "how-we-work-link"
    );
  });
});

describe("AffiliateLink", () => {
  it("always renders target=_blank and rel=sponsored noopener nofollow", () => {
    render(<AffiliateLink href="https://shop.example/x">Buy</AffiliateLink>);
    const link = screen.getByRole("link", { name: "Buy" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "sponsored noopener nofollow");
    expect(link).toHaveAttribute("href", "https://shop.example/x");
  });
});
