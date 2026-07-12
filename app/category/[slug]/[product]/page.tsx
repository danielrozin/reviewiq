import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, categories } from "@/data/categories";
import { getProductBySlug, getProductsByCategory, getAffinityProducts } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartScore } from "@/components/ui/SmartScore";
import { RatingStars } from "@/components/ui/RatingStars";
import { RatingDistribution } from "@/components/ui/RatingDistribution";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { AISummaryCard } from "@/components/product/AISummaryCard";
import { ReviewCard } from "@/components/product/ReviewCard";
import { RecurringIssues } from "@/components/product/RecurringIssues";
import { SpecsTable } from "@/components/product/SpecsTable";
import { ComparisonModule } from "@/components/product/ComparisonModule";
import { ExternalComparisonLinks } from "@/components/product/ExternalComparisonLinks";
import { FAQSection } from "@/components/product/FAQSection";
import { ProductDiscussions } from "@/components/community/ProductDiscussions";
import { getDiscussionsByProduct } from "@/data/discussions";
import { buildMetadata } from "@/lib/seo/metadata";
import { productSchema, speakableSchema, videoObjectListSchema } from "@/lib/schema/jsonld";
import { formatNumber, productAverageRating } from "@/lib/utils";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { PeopleAlsoReviewed } from "@/components/product/PeopleAlsoReviewed";
import {
  TrackProductView,
  YouTubeVideos,
  ReviewFormCTA,
} from "@/components/product/ProductPageClientWidgets";
import { BestFor } from "@/components/product/BestFor";
import { EmailCaptureCTA } from "@/components/product/EmailCaptureCTA";
import { StickyMobileCTA } from "@/components/product/StickyMobileCTA";

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

  const year = new Date().getFullYear();
  return buildMetadata({
    title: `${product.name} Review (${year}) — SmartScore ${product.smartScore}/100`,
    description: `Honest ${product.name} review based on ${product.reviewCount} verified buyer experiences. See what people love, hate, and who this product is best for.`,
    path: `/category/${slug}/${productSlug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug, product: productSlug } = await params;
  const category = getCategoryBySlug(slug);
  const product = getProductBySlug(slug, productSlug);

  if (!category || !product) notFound();

  const productDiscussions = getDiscussionsByProduct(product.slug);

  // Full-population average (from ratingDistribution/reviewCount) so the hero star
  // rating matches the review-section summary, OG card, and Product JSON-LD instead
  // of averaging only the small sample in product.reviews.
  const avgRating = productAverageRating(product);

  // Same-category related products (exclude current)
  const relatedSameCategory = getProductsByCategory(slug)
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => b.smartScore - a.smartScore)
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      smartScore: p.smartScore,
      reviewCount: p.reviewCount,
      priceMin: p.priceRange.min,
      priceMax: p.priceRange.max,
      categorySlug: p.categorySlug,
      categoryName: category.name,
      image: p.image,
    }));

  // Cross-category affinity products
  const affinityProducts = getAffinityProducts(slug, product.slug, 4);

  const pSchema = productSchema(product);
  // Emit VideoObject structured data for the YouTube reviews rendered below so
  // they're eligible for Google video rich results / the video carousel. The
  // list helper filters inactive videos; guard on the *filtered* length so we
  // never emit an empty JSON-LD array. Thumbnail/content/embed URLs all resolve
  // from the video id, so no 404-image trap.
  const videoSchemas = product.youtubeVideos?.length
    ? videoObjectListSchema(product.youtubeVideos, product.name)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <TrackProductView slug={product.slug} category={category.slug} />
      {pSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(speakableSchema(product.name, `/category/${slug}/${productSlug}`, {
            description: product.description ?? undefined,
            datePublished: product.createdAt ?? undefined,
            dateModified: product.updatedAt ?? undefined,
            categorySlug: slug,
          })),
        }}
      />
      {/* FAQ JSON-LD is emitted by <FAQSection> (rendered below, co-located with
          the visible FAQ) — the single FAQPage source, matching the compare page.
          Do NOT re-emit it here: two identical FAQPage nodes on one page make
          Google drop the FAQ rich result. */}
      {videoSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoSchemas),
          }}
        />
      )}

      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
          {
            name: product.name,
            url: `/category/${slug}/${productSlug}`,
          },
        ]}
      />

      {/* Product Header */}
      <header className="mt-8 mb-10">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-wider mb-2">
          {product.brand}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed mb-6">
          {product.description}
        </p>

        <div className="flex flex-wrap items-center gap-6" data-speakable="smart-score">
          <SmartScore score={product.smartScore} size="lg" />

          <div className="h-12 w-px bg-gray-200 hidden sm:block" />

          <div>
            <RatingStars rating={avgRating} size="md" showValue />
            <p className="text-sm text-gray-500 mt-1">
              Based on {formatNumber(product.reviewCount)} reviews
            </p>
          </div>

          <div className="h-12 w-px bg-gray-200 hidden sm:block" />

          <div>
            <p className="text-lg font-semibold text-gray-900">
              ${product.priceRange.min} — ${product.priceRange.max}
            </p>
            <p className="text-sm text-gray-400">Price range</p>
          </div>

          <div className="h-12 w-px bg-gray-200 hidden sm:block" />

          <div>
            <p className="text-lg font-semibold text-emerald-600">
              {product.verifiedPurchaseRate}%
            </p>
            <p className="text-sm text-gray-400">Verified buyers</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column — Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Review CTA — above-fold experiment variant */}
          <ReviewFormCTA
            productName={product.name}
            productSlug={product.slug}
            categorySlug={slug}
          />

          {/* AI Summary */}
          <div data-speakable="ai-summary">
            <AISummaryCard summary={product.aiSummary} />
          </div>

          {/* Tertiary "Where to buy" CTA (Option C, DAN-974) — links to the
              dedicated sub-page; deliberately NOT an inline buy button. */}
          <div>
            <Link
              href={`/category/${slug}/${productSlug}/where-to-buy`}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Where to buy
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Best For / Not Ideal For */}
          <BestFor summary={product.aiSummary} />

          {/* YouTube Videos */}
          {product.youtubeVideos && product.youtubeVideos.length > 0 && (
            <YouTubeVideos
              videos={product.youtubeVideos}
              productName={product.name}
            />
          )}

          {/* Key Facts */}
          <section className="bg-gray-50 rounded-2xl p-6" data-speakable="key-facts">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Key Facts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.aiSummary.keyFacts.map((fact, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  {fact}
                </div>
              ))}
            </div>
          </section>

          {/* Rating Distribution */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Review Distribution
            </h2>
            <div className="max-w-md">
              <RatingDistribution
                distribution={product.ratingDistribution}
                totalReviews={product.reviewCount}
              />
            </div>
          </section>

          {/* Recurring Issues */}
          {product.recurringIssues.length > 0 && (
            <RecurringIssues issues={product.recurringIssues} />
          )}

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Verified Reviews
              </h2>
              <span className="text-sm text-gray-400">
                {product.reviews.length} shown
              </span>
            </div>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>

          {/* Community Discussion */}
          <ProductDiscussions
            threads={productDiscussions}
            productName={product.name}
          />
        </div>

        {/* Right Column — Sidebar */}
        <aside className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SmartScore</span>
                <span className="font-semibold text-gray-900">
                  {product.smartScore}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Rating</span>
                <span className="font-semibold text-gray-900">
                  {avgRating.toFixed(1)}/5
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Reviews</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(product.reviewCount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Verified Rate</span>
                <span className="font-semibold text-emerald-600">
                  {product.verifiedPurchaseRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price Range</span>
                <span className="font-semibold text-gray-900">
                  ${product.priceRange.min}–${product.priceRange.max}
                </span>
              </div>
            </div>

            {/* Top Complaints */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-red-600 mb-2">
                Top Complaints
              </h4>
              <ul className="space-y-1.5">
                {product.aiSummary.topComplaints.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-red-400 shrink-0">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specs */}
          <SpecsTable specs={product.specs} />

          {/* Comparisons */}
          <ComparisonModule
            currentProduct={product.name}
            currentProductSlug={product.slug}
            comparisons={product.comparisons}
            categorySlug={slug}
          />

          {/* Curated head-to-head comparisons on aversusb.net. Restores
              editorial cross-referral links (dropped in the f000c51 product-page
              rewrite). Self-guards: renders null when externalComparisons is
              empty, so only the curated products (n=7) show it. Auto-generated
              AutoComparisonLinks is intentionally NOT restored — its /entity/
              and /alternatives/ targets are soft-404 templates that resolve for
              any slug, so it would emit site-wide dofollow links to thin pages. */}
          {product.externalComparisons && product.externalComparisons.length > 0 && (
            <ExternalComparisonLinks comparisons={product.externalComparisons} />
          )}

          {/* FAQ */}
          <FAQSection items={product.faq} />
        </aside>
      </div>

      {/* Email Capture CTA — "Get notified when SmartScore changes" (restores
          ca305f36, dropped in the f000c51 product-page rewrite). Consent-clean
          per-product alert opt-in; the organic growth engine for the owned
          email list (gates the survey n≥30 goal). */}
      <div className="mt-12 mb-4">
        <EmailCaptureCTA
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
        />
      </div>

      {/* Related Products — Same Category */}
      <RelatedProducts
        products={relatedSameCategory}
        categorySlug={slug}
        categoryName={category.name}
      />

      {/* People Also Reviewed — Cross-Category Affinity */}
      <PeopleAlsoReviewed products={affinityProducts} />

      {/* Persistent thumb-reachable mobile CTA (CRO Check 04). Restored —
          silently dropped in the f000c51 product-page rewrite alongside
          EmailCaptureCTA. lg:hidden so it never shows on desktop. */}
      <StickyMobileCTA productName={product.name} productSlug={product.slug} />
    </div>
  );
}
