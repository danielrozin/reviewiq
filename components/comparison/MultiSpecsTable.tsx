import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface MultiSpecsTableProps {
  products: Product[];
}

export function MultiSpecsTable({ products }: MultiSpecsTableProps) {
  const allLabels = new Map<string, { group: string; values: Map<string, string> }>();

  for (const product of products) {
    for (const spec of product.specs) {
      const existing = allLabels.get(spec.label);
      if (existing) {
        existing.values.set(product.id, spec.value);
      } else {
        const values = new Map<string, string>();
        values.set(product.id, spec.value);
        allLabels.set(spec.label, { group: spec.group || "General", values });
      }
    }
  }

  const groups = new Map<string, { label: string; values: Map<string, string> }[]>();
  for (const [label, data] of allLabels) {
    const list = groups.get(data.group) || [];
    list.push({ label, values: data.values });
    groups.set(data.group, list);
  }

  const colTemplate = `160px ${products.map(() => "1fr").join(" ")}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Specs Comparison</h2>
        {/* Mobile scroll hint */}
        <p className="text-xs text-gray-400 sm:hidden flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
          Scroll to compare
        </p>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <div style={{ minWidth: `${160 + products.length * 140}px` }}>
            {/* Sticky header */}
            <div
              className="grid bg-gray-50 border-b border-gray-100 sticky top-0 z-10"
              style={{ gridTemplateColumns: colTemplate }}
            >
              <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Spec
              </div>
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center",
                    i === 0 ? "text-brand-700" : "text-gray-500"
                  )}
                >
                  <span className="block truncate">{product.brand}</span>
                  <span className="block text-[10px] font-normal text-gray-400 truncate">{product.name}</span>
                </div>
              ))}
            </div>

            {Array.from(groups.entries()).map(([groupName, specs], gi) => (
              <div key={groupName}>
                {groups.size > 1 && (
                  <div className="px-4 py-2 bg-gray-50/60 text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    {groupName}
                  </div>
                )}
                {specs.map((spec, si) => {
                  const uniqueValues = new Set(products.map((p) => spec.values.get(p.id) || ""));
                  const isDifferent = uniqueValues.size > 1 && !uniqueValues.has("");
                  const isLast = si === specs.length - 1 && gi === groups.size - 1;

                  return (
                    <div
                      key={spec.label}
                      className={cn(
                        "grid text-sm",
                        !isLast && "border-b border-gray-50",
                        isDifferent && "bg-amber-50/40"
                      )}
                      style={{ gridTemplateColumns: colTemplate }}
                    >
                      <div className="px-4 py-3 text-gray-500 flex items-center gap-2">
                        <span className="truncate">{spec.label}</span>
                        {isDifferent && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full leading-none shrink-0">
                            diff
                          </span>
                        )}
                      </div>
                      {products.map((product, i) => {
                        const value = spec.values.get(product.id);
                        return (
                          <div
                            key={product.id}
                            className={cn(
                              "px-4 py-3 font-medium text-center",
                              value
                                ? isDifferent && i === 0 ? "text-brand-700" : "text-gray-900"
                                : "text-gray-300"
                            )}
                          >
                            {value || "—"}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
