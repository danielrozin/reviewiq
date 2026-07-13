import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategorySnapshot } from "@/components/blog/CategorySnapshot";
import { getProductsByCategory } from "@/data/products";
import { productAverageRating } from "@/lib/utils";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Deliberately runs against the real product data, not fixtures: the whole point of
// this component is that its numbers are the ones we actually publish, and a fixture
// would let a wrong figure pass. See the fabricated-VideoObject regression (DAN-2061).
describe("CategorySnapshot", () => {
  it("renders nothing for a category with no tracked products", () => {
    const { container } = render(
      <CategorySnapshot categorySlug="no-such-category" categoryName="Nonsense" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("states the real product count and review total for the category", () => {
    const products = getProductsByCategory("air-fryers");
    const reviews = products.reduce((n, p) => n + p.reviewCount, 0);

    render(<CategorySnapshot categorySlug="air-fryers" categoryName="Air Fryers" />);

    expect(
      screen.getByText(new RegExp(`We track\\s*${products.length}`))
    ).toBeTruthy();
    expect(
      screen.getByText(new RegExp(reviews.toLocaleString("en-US")))
    ).toBeTruthy();
  });

  it("links the top-rated products to their product pages with their true rating", () => {
    const top = [...getProductsByCategory("air-fryers")].sort(
      (a, b) => b.smartScore - a.smartScore
    )[0];

    render(<CategorySnapshot categorySlug="air-fryers" categoryName="Air Fryers" />);

    const link = screen.getByRole("link", { name: top.name });
    expect(link.getAttribute("href")).toBe(`/category/air-fryers/${top.slug}`);
    // The rating shown must be the distribution-derived one, never the review sample.
    expect(
      screen.getByText(productAverageRating(top).toFixed(1), { exact: false })
    ).toBeTruthy();
  });

  it("gives each category a different snapshot, so the pages are not near-duplicates", () => {
    const { container: airFryers } = render(
      <CategorySnapshot categorySlug="air-fryers" categoryName="Air Fryers" />
    );
    const { container: laptops } = render(
      <CategorySnapshot categorySlug="laptops" categoryName="Laptops" />
    );
    expect(airFryers.textContent).not.toBe(laptops.textContent);
  });
});
