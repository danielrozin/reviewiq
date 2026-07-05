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

  const descriptionColors = {
    low: "text-yellow-700",
    medium: "text-orange-700",
    high: "text-red-700",
  };

  const severityIcons = {
    low: (
      <svg aria-hidden="true" className="w-3 h-3 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    medium: (
      <svg aria-hidden="true" className="w-3 h-3 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    high: (
      <svg aria-hidden="true" className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  };

  return (
    <section aria-labelledby="recurring-issues-heading" data-speakable="recurring-issues">
      <div className="flex items-center gap-2.5 mb-1">
        <div aria-hidden="true" className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 id="recurring-issues-heading" className="text-lg font-semibold text-gray-900">
          Recurring Issues
        </h2>
        <span className="ml-auto text-xs text-gray-600 font-medium tabular-nums">{issues.length} issues</span>
      </div>
      <p className="text-sm text-gray-600 mb-4 ml-9">
        Common problems reported by multiple verified buyers
      </p>
      <ul role="list" className="space-y-3">
        {issues.map((issue, i) => (
          <li
            key={i}
            className={cn(
              "border rounded-xl p-4 hover:shadow-sm transition-all duration-200",
              severityColors[issue.severity]
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span role="img" className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", {
                  "bg-yellow-100": issue.severity === "low",
                  "bg-orange-100": issue.severity === "medium",
                  "bg-red-100": issue.severity === "high",
                })} aria-label={`${issue.severity} severity`}>
                  <span aria-hidden="true">{severityIcons[issue.severity]}</span>
                </span>
                <h3 className="font-medium text-sm">{issue.title}</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60">
                <svg aria-hidden="true" className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
                {issue.mentionCount} mentions
              </span>
            </div>
            <p className={cn("text-sm", descriptionColors[issue.severity])}>{issue.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
