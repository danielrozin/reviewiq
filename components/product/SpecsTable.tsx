import type { ProductSpec } from "@/types";

interface SpecsTableProps {
  specs: ProductSpec[];
}

export function SpecsTable({ specs }: SpecsTableProps) {
  const groups = specs.reduce<Record<string, ProductSpec[]>>((acc, spec) => {
    const group = spec.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(spec);
    return acc;
  }, {});

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m17.25 2.625h-1.5c-.621 0-1.125-.504-1.125-1.125M20.625 19.5V5.625m0 12.75v-1.5c0-.621-.504-1.125-1.125-1.125M6 18.375V5.625A1.125 1.125 0 0 1 7.125 4.5h9.75A1.125 1.125 0 0 1 18 5.625v12.75m-12 0h6m-6-4.5h6m-6-4.5h6" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Technical Specifications
        </h2>
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {Object.entries(groups).map(([groupName, groupSpecs], gi) => (
          <div key={groupName}>
            {Object.keys(groups).length > 1 && (
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {groupName}
              </div>
            )}
            {groupSpecs.map((spec, si) => (
              <div
                key={si}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm",
                  si < groupSpecs.length - 1 || gi < Object.keys(groups).length - 1
                    ? "border-b border-gray-50"
                    : ""
                )}
              >
                <span className="text-gray-500">{spec.label}</span>
                <span className="text-gray-900 font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
