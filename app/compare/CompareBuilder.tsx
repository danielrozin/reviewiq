"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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

// Reads `?ids=` from the URL, so this subtree is client-only and is skipped when
// Next prerenders the route. Every heading it renders is an <h2>: the page's sole
// <h1> lives in the server-rendered shell (app/compare/page.tsx) and describes the
// hub, which is what `/compare?ids=…` canonicalises to.
export default function CompareBuilder() {
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
      <div className="max-w-4xl mx-auto px-4 pb-8 text-center">
        <div className="flex justify-center mb-6">
          <ProductSearch selectedIds={ids} onAdd={addProduct} />
        </div>
        {compareProducts.length === 1 && (
          <p className="text-sm text-gray-400">
            {compareProducts[0].name} selected — add one more to compare.
          </p>
        )}
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
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

export function CompareBuilderSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <div className="h-11 bg-gray-100 rounded-xl w-full max-w-md mx-auto animate-pulse" />
    </div>
  );
}
