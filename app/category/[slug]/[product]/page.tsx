import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategoryBySlug, categories } from "@/data/categories";
import { getProductBySlug, getProductsByCategory, getAffinityProducts } from "@/data/products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SmartScore } from "@/components/ui/SmartScore";
import { RatingStars } from "@/components/ui/RatingStars";
import { RatingDistribution } from "@/components/ui/RatingDistribution";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { AISummaryCard } from "@/components/product/AISummaryCard";
import { ReviewsWithFilter } from "@/components/product/ReviewsWithFilter";
import { RecurringIssues } from "@/components/product/RecurringIssues";
import { SpecsTable } from "@/components/product/SpecsTable";
import { ComparisonModule } from "@/components/product/ComparisonModule";
import { FAQSection } from "@/components/product/FAQSection";
import { YouTubeVideos } from "@/components/product/YouTubeVideos";
import { ProductDiscussions } from "@/components/community/ProductDiscussions";
import { getDiscussionsByProduct } from "@/data/discussions";
import { buildMetadata } from "@/lib/seo/metadata";
import { productSchema, speakableSchema, faqSchema, videoObjectListSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { formatNumber } from "@/lib/utils";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { PeopleAlsoReviewed } from "@/components/product/PeopleAlsoReviewed";
import { TrackProductView } from "@/components/tracking/TrackProductView";
import { TrackRecentlyViewed } from "@/components/product/TrackRecentlyViewed";
import { ReviewFormCTA } from "@/components/product/ReviewFormCTA";
import { BestFor } from "@/components/product/BestFor";
import { StickyMobileCTA } from "@/components/product/StickyMobileCTA";
import { ProductJumpNav } from "@/components/product/ProductJumpNav";
import { ShareButtons } from "@/components/ui/ShareButtons";

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
    title: `${product.name} Review — SmartScore ${product.smartScore}/100`,
    description: `Honest ${product.name} review based on ${product.reviewCount} verified buyer experiences. See what people love, hate, and who this product is best for.`,
    path: `/category/${slug}/${productSlug}`,
    ogType: "article",
    publishedTime: product.createdAt,
    modifiedTime: product.updatedAt || product.createdAt,
    keywords: [product.name, product.brand, "review", "SmartScore", "verified buyer"],
    image: product.image,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug, product: productSlug } = await params;
  const category = getCategoryBySlug(slug);
  const product = getProductBySlug(slug, productSlug);

  if (!category || !product) notFound();

  const productDiscussions = getDiscussionsByProduct(product.slug);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TrackProductView slug={product.slug} category={category.slug} />
      <ProductJumpNav />
      <StickyMobileCTA
        productName={product.name}
        productSlug={product.slug}
        smartScore={product.smartScore}
      />
      <TrackRecentlyViewed
        slug={product.slug}
        name={product.name}
        brand={product.brand}
        categorySlug={category.slug}
        smartScore={product.smartScore}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema(product, `/category/${slug}/${productSlug}`)),
        }}
      />
      {product.youtubeVideos && product.youtubeVideos.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoObjectListSchema(product.youtubeVideos, product.name)),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(speakableSchema(product.name, `/category/${slug}/${productSlug}`, product.createdAt, product.updatedAt || product.createdAt)),
        }}
      />
      {product.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema(product.faq, `/category/${slug}/${productSlug}`)),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Categories", url: "/categories" },
              { name: category.name, url: `/category/${slug}` },
              { name: product.name, url: `/category/${slug}/${productSlug}` },
            ])
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Categories", url: "/categories" },
          { name: category.name, url: `/category/${slug}` },
          { name: product.name, url: `/category/${slug}/${productSlug}` },
        ]}
      />

      {/* Product Header */}
      <header className="mt-8 mb-10">
        <div className="lg:flex lg:items-start lg:gap-10">
          {/* Product image — left column on desktop */}
          {product.image && (
            <div className="lg:w-60 xl:w-72 shrink-0 mb-8 lg:mb-0">
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 0px, 288px"
                  className="object-contain p-6"
                  priority
                />
              </div>
              {/* Score pill under image */}
              <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <SmartScore score={product.smartScore} size="sm" showLabel={false} />
                <span className="text-sm font-semibold text-gray-800">{product.smartScore}/100 SmartScore</span>
              </div>
            </div>
          )}

          {/* Meta info — right column */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wider mb-2">
              {product.brand}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 max-w-2xl leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center gap-6" data-speakable="smart-score">
              {!product.image && <SmartScore score={product.smartScore} size="lg" showRing animateOnView />}
              {!product.image && <div className="h-12 w-px bg-gray-200 hidden sm:block" />}

              <div>
                <RatingStars rating={avgRating} size="md" showValue />
                <p className="text-sm text-gray-600 mt-1">
                  Based on {formatNumber(product.reviewCount)} reviews
                </p>
              </div>

              <div className="h-12 w-px bg-gray-200 hidden sm:block" />

              <div>
                <p className="text-lg font-semibold text-gray-900">
                  ${product.priceRange.min} — ${product.priceRange.max}
                </p>
                <p className="text-sm text-gray-600">Price range</p>
              </div>

              <div className="h-12 w-px bg-gray-200 hidden sm:block" />

              <div>
                <p className="text-lg font-semibold text-emerald-600">
                  {product.verifiedPurchaseRate}%
                </p>
                <p className="text-sm text-gray-600">Verified buyers</p>
              </div>
            </div>

            {/* Share row */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <ShareButtons
                url={`/category/${slug}/${productSlug}`}
                title={`${product.name} Review — SmartScore ${product.smartScore}/100`}
                description={`Honest ${product.name} review based on ${product.reviewCount} verified buyer experiences. See what people love, hate, and who this is best for.`}
              />
            </div>
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
          <div id="section-summary">
            <AISummaryCard summary={product.aiSummary} score={product.smartScore} />
          </div>

          {/* Best For / Not Ideal For */}
          <BestFor
            summary={product.aiSummary}
            productName={product.name}
            productSlug={`${slug}/${productSlug}`}
          />

          {/* YouTube Videos */}
          {product.youtubeVideos && product.youtubeVideos.length > 0 && (
            <YouTubeVideos
              videos={product.youtubeVideos}
              productName={product.name}
            />
          )}

          {/* Key Facts */}
          <section aria-labelledby="key-facts-heading" className="bg-gray-50 rounded-2xl p-6" data-speakable="key-facts">
            <h2 id="key-facts-heading" className="text-lg font-semibold text-gray-900 mb-4">
              Key Facts
            </h2>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.aiSummary.keyFacts.map((fact, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  {fact}
                </li>
              ))}
            </ul>
          </section>

          {/* Rating Distribution */}
          <section aria-labelledby="review-distribution-heading">
            <h2 id="review-distribution-heading" className="text-lg font-semibold text-gray-900 mb-4">
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
          <ReviewsWithFilter
            reviews={product.reviews}
            totalCount={product.reviewCount}
          />

          {/* Community Discussion */}
          <ProductDiscussions
            threads={productDiscussions}
            productName={product.name}
          />
        </div>

        {/* Right Column — Sidebar */}
        <aside aria-label="Product sidebar" className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-gray-900">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SmartScore</span>
                <span className="font-semibold text-gray-900">
                  {product.smartScore}/100
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Rating</span>
                <span className="font-semibold text-gray-900">
                  {avgRating.toFixed(1)}/5
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(product.reviewCount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verified Rate</span>
                <span className="font-semibold text-emerald-600">
                  {product.verifiedPurchaseRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price Range</span>
                <span className="font-semibold text-gray-900">
                  ${product.priceRange.min}–${product.priceRange.max}
                </span>
              </div>
            </div>

            {/* Top Complaints */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-red-600 mb-2">
                Top Complaints
              </h3>
              <ul className="space-y-1.5">
                {product.aiSummary.topComplaints.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span aria-hidden="true" className="text-red-400 shrink-0">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specs */}
          <div id="section-specs">
            <SpecsTable specs={product.specs} />
          </div>

          {/* Comparisons */}
          <div id="section-compare">
            <ComparisonModule
              currentProduct={product.name}
              currentProductSlug={product.slug}
              comparisons={product.comparisons}
              categorySlug={slug}
            />
          </div>

          {/* FAQ */}
          <div id="section-faq">
            <FAQSection items={product.faq} />
          </div>
        </aside>
      </div>

      {/* Related Products — Same Category */}
      <RelatedProducts
        products={relatedSameCategory}
        categorySlug={slug}
        categoryName={category.name}
      />

      {/* People Also Reviewed — Cross-Category Affinity */}
      <PeopleAlsoReviewed products={affinityProducts} />
    </div>
  );
}
