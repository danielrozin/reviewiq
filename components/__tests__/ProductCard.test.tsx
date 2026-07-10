import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

// --- Mocks ---

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/components/ui/SmartScore", () => ({
  SmartScore: ({ score }: { score: number }) => (
    <div data-testid="smart-score">{score}</div>
  ),
}));

vi.mock("@/components/ui/RatingStars", () => ({
  RatingStars: ({ rating }: { rating: number }) => (
    <div data-testid="rating-stars">{rating}</div>
  ),
}));

vi.mock("@/lib/utils", () => ({
  formatNumber: (n: number) => n.toLocaleString(),
  productAverageRating: (p: any) => {
    const d = p.ratingDistribution;
    const total = p.reviewCount || 0;
    if (!d || total <= 0) return 0;
    return (d[5] * 5 + d[4] * 4 + d[3] * 3 + d[2] * 2 + d[1] * 1) / total;
  },
}));

const mockAdd = vi.fn();
const mockRemove = vi.fn();
const mockHas = vi.fn().mockReturnValue(false);

vi.mock("@/lib/context/CompareContext", () => ({
  useCompare: () => ({
    add: mockAdd,
    remove: mockRemove,
    has: mockHas,
    isFull: false,
  }),
}));

// --- Fixtures ---

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    brand: "Sony",
    categoryId: "cat-1",
    categorySlug: "headphones",
    description: "Premium noise-cancelling headphones",
    image: "/images/sony-xm5.jpg",
    priceRange: { min: 298, max: 399, currency: "USD" },
    smartScore: 92,
    verifiedPurchaseRate: 87,
    reviewCount: 2345,
    ratingDistribution: { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 },
    aiSummary: {
      whatPeopleLove: ["Amazing noise cancellation"],
      whatPeopleHate: ["Expensive for casual listeners"],
      bestFor: ["Frequent travelers"],
      notFor: ["Budget shoppers"],
      topComplaints: ["Headband pressure"],
      keyFacts: ["30-hour battery life"],
    },
    specs: [],
    recurringIssues: [],
    comparisons: [],
    faq: [],
    reviews: [
      {
        id: "r1",
        productId: "prod-1",
        headline: "Great headphones",
        rating: 5,
        verifiedPurchase: true,
        verificationTier: "receipt_upload",
        timeOwned: "6 months",
        experienceLevel: "expert",
        pros: ["Great sound"],
        cons: ["Pricey"],
        reliabilityRating: 5,
        easeOfUseRating: 4,
        valueRating: 4,
        body: "Love them",
        aiTopics: ["sound quality"],
        authorName: "Jane",
        createdAt: "2026-01-15",
        helpfulCount: 12,
      },
    ],
    ...overrides,
  };
}

// --- Tests ---

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHas.mockReturnValue(false);
  });

  it("renders the product name and brand", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.getByText("Sony WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("Sony")).toBeInTheDocument();
  });

  it("displays the price range", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.getByText("$298 — $399")).toBeInTheDocument();
  });

  it("shows formatted review count", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.getByText(/2,345 reviews/)).toBeInTheDocument();
  });

  it("renders SmartScore with the correct value", () => {
    render(<ProductCard product={makeProduct()} />);

    const score = screen.getByTestId("smart-score");
    expect(score).toHaveTextContent("92");
  });

  it("shows AI summary highlights", () => {
    render(<ProductCard product={makeProduct()} />);

    expect(screen.getByText("Amazing noise cancellation")).toBeInTheDocument();
    expect(screen.getByText("Expensive for casual listeners")).toBeInTheDocument();
  });

  it("calls add when compare button is clicked and product is not selected", () => {
    const product = makeProduct();
    render(<ProductCard product={product} />);

    const buttons = screen.getAllByRole("button", { name: /compare/i });
    fireEvent.click(buttons[0]);

    expect(mockAdd).toHaveBeenCalledWith(product);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("calls remove when compare button is clicked and product is already selected", () => {
    mockHas.mockReturnValue(true);
    const product = makeProduct();
    render(<ProductCard product={product} />);

    const buttons = screen.getAllByRole("button", { name: /compare/i });
    fireEvent.click(buttons[0]);

    expect(mockRemove).toHaveBeenCalledWith("prod-1");
    expect(mockAdd).not.toHaveBeenCalled();
  });
});
