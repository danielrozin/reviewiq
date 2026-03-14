import type { RecurringIssue } from "@/types";
import { cn } from "@/lib/utils";

interface RecurringIssuesProps {
  issues: RecurringIssue[];
}

export function RecurringIssues({ issues }: RecurringIssuesProps) {
  const severityColors = {
    low: "bg-yellow-50 border-yellow-200 text-yellow-800",
    medium: "bg-orange-50 border-orange-200 text-orange-800",
    high: "bg-red-50 border-red-200 text-red-800",
  };

  const severityDot = {
    low: "bg-yellow-400",
    medium: "bg-orange-400",
    high: "bg-red-500",
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recurring Issues
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Common problems reported by multiple verified buyers
      </p>
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div
            key={i}
            className={cn(
              "border rounded-xl p-4",
              severityColors[issue.severity]
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", severityDot[issue.severity])} />
                <h3 className="font-medium text-sm">{issue.title}</h3>
              </div>
              <span className="text-xs font-medium">
                {issue.mentionCount} mentions
              </span>
            </div>
            <p className="text-sm opacity-80">{issue.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
