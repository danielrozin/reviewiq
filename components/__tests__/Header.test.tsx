import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

// --- Mocks ---

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const useSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => useSession(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/context/SubscriptionContext", () => ({
  useSubscription: () => ({ isPro: false }),
}));

vi.mock("@/components/layout/SearchBar", () => ({
  SearchBar: () => <div data-testid="search-bar" />,
}));

vi.mock("@/components/premium/ProBadge", () => ({
  ProBadge: () => <span data-testid="pro-badge" />,
}));

const dashboardLink = () =>
  screen
    .queryAllByRole("link")
    .find((el) => el.getAttribute("href") === "/dashboard");

beforeEach(() => {
  useSession.mockReset();
});

describe("Header — /dashboard link visibility", () => {
  it("hides the Dashboard link from signed-out visitors", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    render(<Header />);
    expect(dashboardLink()).toBeUndefined();
  });

  it("hides the Dashboard link while the session is still loading", () => {
    useSession.mockReturnValue({ data: null, status: "loading" });
    render(<Header />);
    expect(dashboardLink()).toBeUndefined();
  });

  it("shows the Dashboard link to signed-in users", () => {
    useSession.mockReturnValue({
      data: { user: { name: "Dana", email: "dana@example.com" } },
      status: "authenticated",
    });
    render(<Header />);
    expect(dashboardLink()).toBeDefined();
  });

  it("still renders the public nav for signed-out visitors", () => {
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    render(<Header />);
    expect(
      screen.queryAllByRole("link").some((el) => el.getAttribute("href") === "/products"),
    ).toBe(true);
  });
});
