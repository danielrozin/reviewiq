import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

// jsdom has no IntersectionObserver; the layout's section scroll-spy needs one.
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const SECTIONS = [{ id: "contact", title: "Contact Us" }];

function renderLegalPage() {
  return render(
    <LegalPageLayout
      title="Privacy Policy"
      path="/privacy"
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section id="contact">Contact us anytime.</section>
    </LegalPageLayout>
  );
}

describe("LegalPageLayout breadcrumbs", () => {
  // The layout used to hand-roll its own "Home / <title>" <nav>, which rendered a
  // visible trail with no BreadcrumbList behind it — so Google saw the crumbs on
  // screen but had nothing structured to build the rich result from.
  it("backs the visible breadcrumb trail with BreadcrumbList JSON-LD", () => {
    const { container } = renderLegalPage();

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const schema = JSON.parse(script!.textContent || "{}");
    expect(schema["@type"]).toBe("BreadcrumbList");

    const els = schema.itemListElement;
    expect(els).toHaveLength(2);
    expect(els[0]).toMatchObject({ position: 1, name: "Home" });
    expect(els[1]).toMatchObject({ position: 2, name: "Privacy Policy" });
    expect(els[1].item).toMatch(/\/privacy$/);
  });

  it("keeps the structured trail in step with the visible one", () => {
    const { container } = renderLegalPage();

    const visible = Array.from(
      container.querySelectorAll('nav[aria-label="Breadcrumb"] li')
    )
      .map((li) => li.textContent?.replace(/\//g, "").trim())
      .filter(Boolean);

    const schema = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent || "{}"
    );
    const structured = schema.itemListElement.map((e: any) => e.name);

    expect(visible).toEqual(structured);
  });
});
