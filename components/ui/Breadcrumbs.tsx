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
  // The visible <nav> below always renders "Home" as the first crumb, so the
  // BreadcrumbList JSON-LD must include it too — otherwise the structured trail
  // is offset-by-one from the visible one and Google drops the breadcrumb
  // rich result. Prepend Home here (callers pass items without it).
  const schemaItems = [{ name: "Home", url: "/" }, ...items];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(schemaItems)),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center gap-1.5">
              <span className="text-gray-300">/</span>
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.name}</span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-gray-900 transition-colors"
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
