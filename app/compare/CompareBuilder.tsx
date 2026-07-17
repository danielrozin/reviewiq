"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import { products } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { MultiScoreComparison } from "@/components/comparison/MultiScoreComparison";
import { MultiSpecsTable } from "@/components/comparison/MultiSpecsTable";
import { MultiProsConsComparison } from "@/components/comparison/MultiProsConsComparison";
import { ExportButton } from "@/components/premium/ExportButton";
import { AdPlacement } from "@/components/premium/AdPlacement";

function ProductSearch({ selectedIds, onAdd }: { selectedIds: string[]; onAdd: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = products.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()))
  );

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && open && query.length > 0) {
      e.preventDefault();
      const items = listboxRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
      if (items && items.length > 0) {
        (e.key === "ArrowDown" ? items[0] : items[items.length - 1]).focus();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function selectOption(id: string) {
    onAdd(id);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleOptionKeyDown(e: React.KeyboardEvent<HTMLLIElement>, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(id);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling as HTMLElement | null;
      if (prev) prev.focus(); else inputRef.current?.focus();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      (listboxRef.current?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])'))?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const items = listboxRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
      if (items && items.length > 0) items[items.length - 1].focus();
    }
  }

  return (
    <div ref={ref} className="relative w-full max-w-md" onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && query.length > 0}
        aria-controls={open && query.length > 0 ? "compare-product-listbox" : undefined}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleInputKeyDown}
        autoComplete="off"
        aria-label="Search products to compare"
        placeholder="Search products to compare..."
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:border-transparent"
      />
      {open && query.length > 0 && (
        <ul ref={listboxRef} id="compare-product-listbox" role="listbox" aria-label="Product search results" className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
          {filtered.length === 0 ? (
            <li role="option" aria-selected="false" aria-disabled="true" className="px-4 py-3 text-sm text-gray-600">No products found</li>
          ) : (
            filtered.slice(0, 8).map((p) => (
              <li
                key={p.id}
                role="option"
                aria-selected="false"
                tabIndex={-1}
                onClick={() => selectOption(p.id)}
                onKeyDown={(e) => handleOptionKeyDown(e, p.id)}
                className="px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
              >
                <span className="font-medium text-gray-900">{p.brand}</span>
                <span className="text-gray-600">{p.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);

  const addProduct = (id: string) => {
    const newIds = [...ids, id];
    router.push(`/compare?ids=${newIds.join(",")}`);
  };

  const compareProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  const SUGGESTED_PAIRS = [
    { label: "Sony WH-1000XM5 vs Bose QuietComfort 45", ids: "sony-wh-1000xm5,bose-quietcomfort-45" },
    { label: "Dyson V15 vs Shark IZ462H", ids: "dyson-v15-detect,shark-iz462h" },
    { label: "iRobot Roomba j7+ vs Roborock S7", ids: "irobot-roomba-j7-plus,roborock-s7" },
  ];

  if (compareProducts.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero section */}
        <header className="text-center mb-10">
          <div aria-hidden="true" className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 border border-brand-100 rounded-2xl mb-5 mx-auto">
            <svg aria-hidden="true" className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Products Side-by-Side</h1>
          <p data-speakable="compare-intro" className="text-gray-600 max-w-md mx-auto">
            Search and add 2–4 products to see SmartScores, specs, pros & cons, and an AI verdict — all in one view.
          </p>
        </header>

        {/* Search */}
        <div className="flex justify-center mb-4">
          <ProductSearch selectedIds={ids} onAdd={addProduct} />
        </div>

        {/* Partial selection hint — always-in-DOM live region so AT announces on add */}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-center text-sm text-brand-600 font-medium mb-6"
        >
          {compareProducts.length === 1
            ? `${compareProducts[0].name} added — search for one more product to compare.`
            : ""}
        </p>

        {/* Feature chips */}
        <ul role="list" className="grid grid-cols-3 gap-3 mb-8 mt-6 list-none p-0 m-0">
          {[
            { icon: "📊", label: "SmartScore breakdown" },
            { icon: "🤖", label: "AI verdict" },
            { icon: "📋", label: "Spec-by-spec table" },
          ].map((f) => (
            <li key={f.label} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-center">
              <span aria-hidden="true" className="text-xl">{f.icon}</span>
              <span className="text-xs font-medium text-gray-600">{f.label}</span>
            </li>
          ))}
        </ul>

        {/* Suggested comparisons */}
        <section aria-label="Popular comparisons" className="border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 text-center">Popular comparisons</p>
          <ul role="list" className="flex flex-col gap-2 list-none p-0 m-0">
            {SUGGESTED_PAIRS.map((pair) => (
              <li key={pair.ids}>
              <a
                href={`/compare?ids=${pair.ids}`}
                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
              >
                <span className="text-gray-700 group-hover:text-brand-600 transition-colors font-medium">{pair.label}</span>
                <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </a>
              </li>
            ))}
          </ul>
          <div className="text-center mt-4">
            <a href="/products" className="text-sm text-brand-600 hover:text-brand-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">
              Browse all products <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </div>
    );
  }

  const title = compareProducts.map((p) => p.name).join(" vs ");
  const totalReviews = compareProducts.reduce((sum, p) => sum + p.reviewCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { name: "Products", url: "/products" },
          { name: "Compare", url: `/compare?ids=${idsParam}` },
        ]}
      />

      {/* Header */}
      <header className="text-center mb-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-gray-600 text-sm">
          Side-by-side comparison based on {totalReviews.toLocaleString()} verified buyer reviews
        </p>
        <div className="mt-4 flex justify-center">
          <ProductSearch selectedIds={ids} onAdd={addProduct} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <ShareButtons
            url={`/compare?ids=${idsParam}`}
            title={`${title} — Side-by-Side Comparison`}
            description={`Compare ${compareProducts.length} products side-by-side based on ${totalReviews} verified reviews.`}
          />
          <ExportButton onExport={(format) => {
            // Export logic — generates CSV/PDF of comparison data
            if (format === "csv") {
              const headers = ["Product", "SmartScore", "Price Min", "Price Max", "Review Count"];
              const rows = compareProducts.map((p) => [p.name, p.smartScore, p.priceRange.min, p.priceRange.max, p.reviewCount].join(","));
              const csv = [headers.join(","), ...rows].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `comparison-${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }} />
        </div>
      </header>

      <section aria-label="Comparison results" className="space-y-8">
        <MultiScoreComparison products={compareProducts} />
        <AdPlacement slot="compare-mid" className="my-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xs text-gray-600">
            Advertisement
          </div>
        </AdPlacement>
        <MultiSpecsTable products={compareProducts} />
        <MultiProsConsComparison products={compareProducts} />
      </section>
    </div>
  );
}

export function CompareBuilder() {
  return (
    <Suspense fallback={<CompareLoadingSkeleton />}>
      <CompareContent />
    </Suspense>
  );
}

function CompareLoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading comparison" className="max-w-6xl mx-auto px-4 py-16 motion-safe:animate-pulse">
      <div className="h-8 bg-gray-100 rounded-lg w-96 mx-auto mb-4" />
      <div className="h-4 bg-gray-100 rounded w-64 mx-auto mb-8" />
      <div className="h-64 bg-gray-100 rounded-2xl mb-8" />
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  );
}
