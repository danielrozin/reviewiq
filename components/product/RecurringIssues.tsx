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

  const severityIcons = {
    low: (
      <svg className="w-3 h-3 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    medium: (
      <svg className="w-3 h-3 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    high: (
      <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  };

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Recurring Issues
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-4 ml-9.5">
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
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", {
                  "bg-yellow-100": issue.severity === "low",
                  "bg-orange-100": issue.severity === "medium",
                  "bg-red-100": issue.severity === "high",
                })}>
                  {severityIcons[issue.severity]}
                </span>
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
