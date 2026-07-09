import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Home", url: "/" }, ...items])),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-gray-500">/</span>
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-gray-900 font-medium truncate max-w-[10rem] sm:max-w-xs">{item.name}</span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
