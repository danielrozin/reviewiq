import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Write a Review",
      description: "Share your experience with a product",
      href: "/write-review",
      icon: "✎",
      color: "bg-brand-50 text-brand-600 hover:bg-brand-100",
    },
    {
      title: "Compare Products",
      description: "Find the best option for your needs",
      href: "/categories",
      icon: "⇋",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      title: "View Trending",
      description: "See what the community is discussing",
      href: "/community",
      icon: "↗",
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className={`flex items-center gap-3 p-4 rounded-xl border border-transparent transition-all ${action.color}`}
        >
          <span className="text-xl">{action.icon}</span>
          <div>
            <h3 className="text-sm font-semibold">{action.title}</h3>
            <p className="text-[10px] opacity-70">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
