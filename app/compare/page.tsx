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
import { comparisonHubSchema } from "@/lib/schema/jsonld";
import { getAllComparisonPairs } from "@/data/comparisons";

function ProductSearch({ selectedIds, onAdd }: { selectedIds: string[]; onAdd: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search products to compare..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
      {open && query.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No products found</p>
          ) : (
            filtered.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => { onAdd(p.id); setQuery(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span className="font-medium text-gray-900">{p.brand}</span>
                <span className="text-gray-500">{p.name}</span>
              </button>
            ))
          )}
        </div>
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

  if (compareProducts.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Products</h1>
        <p className="text-gray-500 mb-6">
          Search and select at least 2 products to start comparing.
        </p>
        <div className="flex justify-center mb-6">
          <ProductSearch selectedIds={ids} onAdd={addProduct} />
        </div>
        {compareProducts.length === 1 && (
          <p className="text-sm text-gray-400">
            {compareProducts[0].name} selected — add one more to compare.
          </p>
        )}
        <a
          href="/products"
          className="inline-flex items-center px-5 py-2.5 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
        >
          Or browse all products
        </a>
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
      <div className="text-center mb-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-gray-500 text-sm">
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
      </div>

      <div className="space-y-8">
        <MultiScoreComparison products={compareProducts} />
        <AdPlacement slot="compare-mid" className="my-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
            Advertisement
          </div>
        </AdPlacement>
        <MultiSpecsTable products={compareProducts} />
        <MultiProsConsComparison products={compareProducts} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  // Hub CollectionPage + ItemList schema. Emitted only on the /compare index
  // route (NOT the shared layout), so it does not leak the full comparison list
  // onto every /compare/[slug] detail money page. Rendered here in the client
  // component so it still lands in the SSR HTML for crawlers.
  const hubSchema = comparisonHubSchema(getAllComparisonPairs());
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
      <Suspense fallback={<CompareLoadingSkeleton />}>
        <CompareContent />
      </Suspense>
    </>
  );
}

function CompareLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-lg w-96 mx-auto mb-4" />
      <div className="h-4 bg-gray-100 rounded w-64 mx-auto mb-8" />
      <div className="h-64 bg-gray-100 rounded-2xl mb-8" />
      <div className="h-96 bg-gray-100 rounded-2xl" />
    </div>
  );
}
