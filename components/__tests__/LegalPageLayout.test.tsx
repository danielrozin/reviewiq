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

const DESCRIPTION =
  "Read the ReviewIQ Privacy Policy to understand how we collect, use, and protect your personal information.";

function renderLegalPage() {
  return render(
    <LegalPageLayout
      title="Privacy Policy"
      path="/privacy"
      description={DESCRIPTION}
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section id="contact">Contact us anytime.</section>
    </LegalPageLayout>
  );
}

// The layout now emits two JSON-LD blocks (WebPage + BreadcrumbList). Select by
// @type rather than by document order so adding a third never silently makes
// these assertions read the wrong node.
function schemaOfType(container: HTMLElement, type: string) {
  const nodes = Array.from(
    container.querySelectorAll('script[type="application/ld+json"]')
  ).map((s) => JSON.parse(s.textContent || "{}"));
  return nodes.filter((n) => n["@type"] === type);
}

describe("LegalPageLayout page-level schema", () => {
  // The four legal pages emitted only Organization + WebSite + BreadcrumbList:
  // a breadcrumb pointing at a page that itself declared no type. This layout is
  // the single seam all four render through.
  it("emits exactly one WebPage node describing the page", () => {
    const { container } = renderLegalPage();
    const pages = schemaOfType(container, "WebPage");

    expect(pages).toHaveLength(1);
    expect(pages[0]).toMatchObject({
      "@type": "WebPage",
      name: "Privacy Policy",
      description: DESCRIPTION,
    });
    expect(pages[0].url).toMatch(/\/privacy$/);
    expect(pages[0]["@id"]).toMatch(/\/privacy#webpage$/);
  });

  // A dateModified that disagrees with the date the reader sees is worse than
  // none — legal pages are judged on recency.
  it("stamps dateModified with the same value as the visible <time>", () => {
    const { container } = renderLegalPage();
    const visible = container.querySelector("time")!.getAttribute("dateTime");

    expect(schemaOfType(container, "WebPage")[0].dateModified).toBe(visible);
  });

  // Re-declaring the Organization inline would spawn a duplicate, unlinked
  // entity instead of merging into the canonical ReviewIQ node.
  it("references the shared Organization/WebSite by @id, never inline", () => {
    const { container } = renderLegalPage();
    const page = schemaOfType(container, "WebPage")[0];

    expect(page.isPartOf["@id"]).toMatch(/#website$/);
    expect(page.about["@id"]).toMatch(/#organization$/);
    expect(page.publisher["@id"]).toMatch(/#organization$/);
    expect(schemaOfType(container, "Organization")).toHaveLength(0);
  });

  // <Breadcrumbs> already emits a standalone BreadcrumbList on these pages;
  // embedding a second trail inside the WebPage would duplicate it.
  it("does not embed a second breadcrumb trail in the WebPage node", () => {
    const { container } = renderLegalPage();

    expect(schemaOfType(container, "WebPage")[0].breadcrumb).toBeUndefined();
    expect(schemaOfType(container, "BreadcrumbList")).toHaveLength(1);
  });
});

describe("LegalPageLayout breadcrumbs", () => {
  // The layout used to hand-roll its own "Home / <title>" <nav>, which rendered a
  // visible trail with no BreadcrumbList behind it — so Google saw the crumbs on
  // screen but had nothing structured to build the rich result from.
  it("backs the visible breadcrumb trail with BreadcrumbList JSON-LD", () => {
    const { container } = renderLegalPage();

    const crumbs = schemaOfType(container, "BreadcrumbList");
    expect(crumbs).toHaveLength(1);

    const els = crumbs[0].itemListElement;
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

    const structured = schemaOfType(container, "BreadcrumbList")[0].itemListElement.map(
      (e: any) => e.name
    );

    expect(visible).toEqual(structured);
  });
});
