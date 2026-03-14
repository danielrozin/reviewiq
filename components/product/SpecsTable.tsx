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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Technical Specifications
      </h2>
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
