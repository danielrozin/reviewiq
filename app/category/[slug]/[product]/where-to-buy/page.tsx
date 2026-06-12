import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, categories } from "@/data/categories";
import { getProductBySlug, getProductsByCategory } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WhereToBuyPanel } from "@/components/affiliate/WhereToBuyPanel";
import { getMerchantOffers, getManufacturerInfo } from "@/lib/affiliate/offers";
import { buildMetadata } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ slug: string; product: string }>;
}

export async function generateStaticParams() {
  const params: { slug: string; product: string }[] = [];
  for (const cat of categories) {
    const prods = getProductsByCategory(cat.slug);
    for (const p of prods) {
      params.push({ slug: cat.slug, product: p.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { slug, product: productSlug } = await params;
  const product = getProductBySlug(slug, productSlug);
  if (!product) return {};

  return buildMetadata({
    title: `Where to Buy the ${product.name} — Compare Prices`,
    description: `Compare current prices for the ${product.name} across trusted retailers. Find the lowest price and buy from your preferred merchant.`,
    path: `/category/${slug}/${productSlug}/where-to-buy`,
  });
}

export default async function WhereToBuyPage({ params }: Props) {
  const { slug, product: productSlug } = await params;
  const category = getCategoryBySlug(slug);
  const product = getProductBySlug(slug, productSlug);

  if (!category || !product) notFound();

  const offers = await getMerchantOffers(product);
  const manufacturer = getManufacturerInfo(product);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
          { name: product.name, url: `/category/${slug}/${productSlug}` },
          {
            name: "Where to buy",
            url: `/category/${slug}/${productSlug}/where-to-buy`,
          },
        ]}
      />

      <header className="mt-8 mb-8">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-wider mb-2">
          {product.brand}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Where to buy the {product.name}
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Live prices from our partner merchants. Pricing and availability are set
          by each retailer and may change.{" "}
          <Link
            href={`/category/${slug}/${productSlug}`}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Back to the {product.name} review →
          </Link>
        </p>
      </header>

      <WhereToBuyPanel
        productSlug={`${slug}/${productSlug}`}
        offers={offers}
        manufacturer={manufacturer}
      />
    </div>
  );
}
