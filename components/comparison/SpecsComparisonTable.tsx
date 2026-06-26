import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface SpecsComparisonTableProps {
  productA: Product;
  productB: Product;
}

export function SpecsComparisonTable({
  productA,
  productB,
}: SpecsComparisonTableProps) {
  const allLabels = new Map<string, { group: string; a?: string; b?: string }>();

  for (const spec of productA.specs) {
    allLabels.set(spec.label, { group: spec.group || "General", a: spec.value });
  }
  for (const spec of productB.specs) {
    const existing = allLabels.get(spec.label);
    if (existing) {
      existing.b = spec.value;
    } else {
      allLabels.set(spec.label, { group: spec.group || "General", b: spec.value });
    }
  }

  const groups = new Map<string, { label: string; a?: string; b?: string }[]>();
  for (const [label, data] of allLabels) {
    const list = groups.get(data.group) || [];
    list.push({ label, a: data.a, b: data.b });
    groups.set(data.group, list);
  }

  const nameA = productA.name.length > 20 ? productA.brand : productA.name;
  const nameB = productB.name.length > 20 ? productB.brand : productB.name;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Specs Comparison
      </h2>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {/* Sticky header */}
        <div className="grid grid-cols-[2fr_1fr_1fr] bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Spec
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-brand-700 uppercase tracking-wider text-center truncate">
            {nameA}
          </div>
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center truncate">
            {nameB}
          </div>
        </div>

        {Array.from(groups.entries()).map(([groupName, specs], gi) => (
          <div key={groupName}>
            {groups.size > 1 && (
              <div className="px-4 py-2 bg-gray-50/60 text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                {groupName}
              </div>
            )}
            {specs.map((spec, si) => {
              const differs = spec.a && spec.b && spec.a !== spec.b;
              const isLast = si === specs.length - 1 && gi === groups.size - 1;
              return (
                <div
                  key={spec.label}
                  className={cn(
                    "grid grid-cols-[2fr_1fr_1fr] text-sm",
                    !isLast && "border-b border-gray-50",
                    differs && "bg-amber-50/40"
                  )}
                >
                  <div className="px-4 py-3 text-gray-500 flex items-center gap-2">
                    {spec.label}
                    {differs && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full leading-none">
                        diff
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "px-4 py-3 font-medium text-center",
                    differs ? "text-brand-700" : "text-gray-900"
                  )}>
                    {spec.a || <span className="text-gray-300">—</span>}
                  </div>
                  <div className="px-4 py-3 text-gray-700 font-medium text-center">
                    {spec.b || <span className="text-gray-300">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
