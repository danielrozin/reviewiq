import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function readBreadcrumbJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.textContent || "{}");
}

describe("Breadcrumbs JSON-LD", () => {
  it("prepends Home so the structured trail matches the visible nav", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { name: "Cameras", url: "/category/cameras" },
          { name: "Sony A vs Canon B", url: "/compare/sony-a-vs-canon-b" },
        ]}
      />
    );

    const schema = readBreadcrumbJsonLd(container);
    expect(schema["@type"]).toBe("BreadcrumbList");

    const els = schema.itemListElement;
    // Home (1) + the two passed crumbs (2, 3) — matches the visible "Home / Cameras / …" trail.
    expect(els).toHaveLength(3);
    expect(els[0]).toMatchObject({ position: 1, name: "Home" });
    expect(els[0].item).toMatch(/\/$/); // site root
    expect(els[1]).toMatchObject({ position: 2, name: "Cameras" });
    expect(els[2]).toMatchObject({ position: 3, name: "Sony A vs Canon B" });
  });

  it("still emits a Home root when no items are passed", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    const schema = readBreadcrumbJsonLd(container);
    expect(schema.itemListElement).toHaveLength(1);
    expect(schema.itemListElement[0]).toMatchObject({ position: 1, name: "Home" });
  });
});
