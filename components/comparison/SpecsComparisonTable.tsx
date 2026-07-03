import { Fragment } from "react";
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
    <section aria-labelledby="specs-comparison" data-speakable="specs-comparison">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m17.25 2.625h-1.5c-.621 0-1.125-.504-1.125-1.125M20.625 19.5V5.625m0 12.75v-1.5c0-.621-.504-1.125-1.125-1.125M6 18.375V5.625A1.125 1.125 0 0 1 7.125 4.5h9.75A1.125 1.125 0 0 1 18 5.625v12.75m-12 0h6m-6-4.5h6m-6-4.5h6" />
          </svg>
        </div>
        <h2 id="specs-comparison" className="text-lg font-semibold text-gray-900">Specs Comparison</h2>
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full table-fixed" aria-labelledby="specs-comparison">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
                Spec
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-brand-700 uppercase tracking-wider text-center truncate">
                {nameA}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center truncate">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(groups.entries()).map(([groupName, specs], gi) => (
              <Fragment key={groupName}>
                {groups.size > 1 && (
                  <tr>
                    <th colSpan={3} scope="colgroup" className="px-4 py-2 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100 text-left font-semibold">
                      {groupName}
                    </th>
                  </tr>
                )}
                {specs.map((spec, si) => {
                  const differs = spec.a && spec.b && spec.a !== spec.b;
                  const isLast = si === specs.length - 1 && gi === groups.size - 1;
                  return (
                    <tr
                      key={spec.label}
                      className={cn(
                        "text-sm",
                        !isLast && "border-b border-gray-50",
                        differs && "bg-amber-50/40"
                      )}
                    >
                      <th scope="row" className="px-4 py-3 text-gray-600 font-normal text-left">
                        <span className="flex items-center gap-2">
                          {spec.label}
                          {differs && (
                            <span aria-label="values differ" className="text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-lg leading-none">
                              diff
                            </span>
                          )}
                        </span>
                      </th>
                      <td className={cn(
                        "px-4 py-3 font-medium text-center",
                        differs ? "text-brand-700" : "text-gray-900"
                      )}>
                        {spec.a || <span aria-label="not available" className="text-gray-500">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium text-center">
                        {spec.b || <span aria-label="not available" className="text-gray-500">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
