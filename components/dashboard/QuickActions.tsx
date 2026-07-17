import Link from "next/link";

const actions = [
  {
    title: "Write a Review",
    description: "Share your experience with a product",
    href: "/write-review",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    borderHover: "hover:border-brand-200 hover:shadow-sm",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
      </svg>
    ),
  },
  {
    title: "Browse Categories",
    description: "Find the best option for your needs",
    href: "/categories",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderHover: "hover:border-purple-200 hover:shadow-sm",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    title: "Join Community",
    description: "Discuss products with real buyers",
    href: "/community",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-200 hover:shadow-sm",
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
];

export function QuickActions() {
  return (
    <nav aria-label="Quick actions">
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <li key={action.title}>
            <Link
              href={action.href}
              aria-label={`${action.title} — ${action.description}`}
              className={`group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden motion-safe:hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${action.borderHover}`}
            >
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="flex items-center gap-4 p-4 w-full">
              <div aria-hidden="true" className={`w-10 h-10 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p aria-hidden="true" className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{action.title}</p>
                <p aria-hidden="true" className="text-xs text-gray-600 mt-0.5 truncate">{action.description}</p>
              </div>
              <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
