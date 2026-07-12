/**
 * Tests for lib/schema/jsonld.ts — SEO structured data generation.
 */
import { describe, it, expect } from 'vitest'
import {
  organizationSchema,
  aboutPageSchema,
  websiteSchema,
  breadcrumbSchema,
  productSchema,
  reviewSchema,
  faqSchema,
  categoryListSchema,
  videoObjectSchema,
  videoObjectListSchema,
  analysisAuthorSchema,
  speakableSchema,
  comparisonSchema,
  blogPostSchema,
  communityThreadSchema,
  profilePageSchema,
  faqHubSchema,
  productsHubSchema,
  whereToBuySchema,
} from '../schema/jsonld'
import type { DiscussionThread, Comment } from '@/types'

describe('organizationSchema', () => {
  it('returns valid Organization schema', () => {
    const schema = organizationSchema()
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('ReviewIQ')
    expect(schema.url).toBeDefined()
  })

  it('carries a stable @id so answer engines consolidate the entity', () => {
    const schema = organizationSchema()
    expect(schema['@id']).toBeDefined()
    expect(String(schema['@id'])).toContain('#organization')
  })

  it('exposes the verified contact email + ContactPoint for the knowledge panel', () => {
    const schema = organizationSchema()
    expect(schema.email).toBe('contact@revieweriq.com')
    expect(Array.isArray(schema.contactPoint)).toBe(true)
    expect(schema.contactPoint[0]['@type']).toBe('ContactPoint')
    expect(schema.contactPoint[0].email).toBe('contact@revieweriq.com')
    expect(schema.contactPoint[0].contactType).toBe('customer support')
  })
})

describe('aboutPageSchema', () => {
  it('returns an AboutPage anchored to the /about URL', () => {
    const schema = aboutPageSchema()
    expect(schema['@type']).toBe('AboutPage')
    expect(schema.url).toContain('/about')
    expect(String(schema['@id'])).toContain('/about#webpage')
  })

  it('references the canonical Organization by @id instead of re-declaring it', () => {
    const schema = aboutPageSchema()
    // Both mainEntity and about must point at the site-wide #organization node
    // so answer engines merge rather than spawn a duplicate entity.
    expect(schema.mainEntity['@id']).toContain('#organization')
    expect(schema.about['@id']).toContain('#organization')
    expect(schema.isPartOf['@id']).toContain('#website')
  })

  it('emits a Home > About breadcrumb trail', () => {
    const schema = aboutPageSchema()
    expect(schema.breadcrumb['@type']).toBe('BreadcrumbList')
    expect(schema.breadcrumb.itemListElement).toHaveLength(2)
    expect(schema.breadcrumb.itemListElement[0].name).toBe('Home')
    expect(schema.breadcrumb.itemListElement[1].name).toBe('About')
    expect(schema.breadcrumb.itemListElement[1].item).toContain('/about')
  })
})

describe('websiteSchema', () => {
  it('returns valid WebSite schema with search action', () => {
    const schema = websiteSchema()
    expect(schema['@type']).toBe('WebSite')
    expect(schema.potentialAction['@type']).toBe('SearchAction')
    // target is a schema.org EntryPoint; urlTemplate must point at the on-site
    // search page (/products?q=), not the JSON-only /api/search 404 target.
    expect(schema.potentialAction.target['@type']).toBe('EntryPoint')
    expect(schema.potentialAction.target.urlTemplate).toContain('/products?q=')
    expect(schema.potentialAction.target.urlTemplate).toContain('{search_term_string}')
    expect(schema.potentialAction['query-input']).toBe('required name=search_term_string')
  })

  it('links to the Organization entity via publisher @id', () => {
    const schema = websiteSchema()
    expect(schema.publisher['@id']).toContain('#organization')
  })
})

describe('breadcrumbSchema', () => {
  it('generates correct positions for breadcrumb items', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Electronics', url: '/category/electronics' },
      { name: 'Headphones', url: '/category/electronics/headphones' },
    ])
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toHaveLength(3)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[2].position).toBe(3)
    expect(schema.itemListElement[1].name).toBe('Electronics')
  })

  it('handles empty breadcrumb list', () => {
    const schema = breadcrumbSchema([])
    expect(schema.itemListElement).toHaveLength(0)
  })
})

describe('productSchema', () => {
  const mockProduct = {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    description: 'Noise canceling headphones',
    image: '/sony.jpg',
    priceRange: { min: 300, max: 400, currency: 'USD' },
    reviewCount: 10,
    reviews: [
      { rating: 5, headline: 'Great', body: 'Excellent', authorName: 'User1', createdAt: '2025-01-01' },
      { rating: 4, headline: 'Good', body: 'Nice', authorName: 'User2', createdAt: '2025-01-02' },
    ],
  } as any

  it('falls back to the sample-review average when no distribution exists', () => {
    const schema = productSchema(mockProduct) as Record<string, any>
    expect(schema.aggregateRating.ratingValue).toBe('4.5')
    expect(schema.aggregateRating.reviewCount).toBe(10)
  })

  it('derives ratingValue from the full ratingDistribution, not the sample reviews', () => {
    // Sample reviews average 4.5, but the full 342-review distribution averages
    // 4.26 — ratingValue must match the reviewCount it is paired with.
    const withDistribution = {
      ...mockProduct,
      reviewCount: 342,
      ratingDistribution: { 5: 185, 4: 98, 3: 32, 2: 18, 1: 9 },
    }
    const schema = productSchema(withDistribution) as Record<string, any>
    expect(schema.aggregateRating.ratingValue).toBe('4.3')
    expect(schema.aggregateRating.reviewCount).toBe(342)
  })

  it('omits aggregateRating and review when product has no reviews', () => {
    const noReviewProduct = { ...mockProduct, reviews: [], reviewCount: 0 }
    const schema = productSchema(noReviewProduct) as Record<string, any>
    expect(schema.aggregateRating).toBeUndefined()
    expect(schema.review).toBeUndefined()
  })

  it('includes price range and offerCount in offers', () => {
    const schema = productSchema(mockProduct) as Record<string, any>
    expect(schema.offers.lowPrice).toBe(300)
    expect(schema.offers.highPrice).toBe(400)
    expect(schema.offers.priceCurrency).toBe('USD')
    expect(schema.offers.offerCount).toBeGreaterThanOrEqual(1)
  })

  it('omits offers when price range is invalid', () => {
    const noPriceProduct = { ...mockProduct, priceRange: { min: 0, max: 0, currency: 'USD' } }
    const schema = productSchema(noPriceProduct) as Record<string, any>
    expect(schema.offers).toBeUndefined()
  })

  it('returns null when no offers, aggregateRating, or review can be populated', () => {
    const bareProduct = { ...mockProduct, reviews: [], reviewCount: 0, priceRange: { min: 0, max: 0, currency: 'USD' } }
    expect(productSchema(bareProduct)).toBeNull()
  })

  it('limits review output to 5', () => {
    const manyReviews = Array(10).fill(mockProduct.reviews[0])
    const schema = productSchema({ ...mockProduct, reviews: manyReviews }) as Record<string, any>
    expect(schema.review).toHaveLength(5)
  })

  it('folds Best For / Not Ideal For into a single Product node as additionalProperty', () => {
    const withSummary = {
      ...mockProduct,
      aiSummary: { bestFor: ['Large homes', 'Pet owners'], notFor: ['Tight budgets'] },
    }
    const schema = productSchema(withSummary) as Record<string, any>
    expect(schema.additionalProperty).toHaveLength(3)
    const bestFor = schema.additionalProperty.filter((p: any) => p.name === 'Best For')
    const notFor = schema.additionalProperty.filter((p: any) => p.name === 'Not Ideal For')
    expect(bestFor.map((p: any) => p.value)).toEqual(['Large homes', 'Pet owners'])
    expect(notFor.map((p: any) => p.value)).toEqual(['Tight budgets'])
    // Single canonical Product node — the buyer-fit signals hang off the same
    // node that carries offers/aggregateRating/review, not a second entity.
    expect(schema['@type']).toBe('Product')
  })

  it('omits additionalProperty when aiSummary is absent (no empty array)', () => {
    const schema = productSchema(mockProduct) as Record<string, any>
    expect(schema.additionalProperty).toBeUndefined()
  })
})

describe('reviewSchema', () => {
  it('returns valid Review schema', () => {
    const schema = reviewSchema({
      headline: 'Amazing',
      rating: 5,
      body: 'Best product ever',
      authorName: 'Tester',
      createdAt: '2025-06-01',
    } as any)
    expect(schema['@type']).toBe('Review')
    expect(schema.reviewRating.ratingValue).toBe(5)
    expect(schema.author.name).toBe('Tester')
  })
})

describe('faqSchema', () => {
  it('generates FAQ structured data', () => {
    const schema = faqSchema([
      { question: 'Is it waterproof?', answer: 'Yes, IPX4 rated.' },
      { question: 'Battery life?', answer: '30 hours.' },
    ] as any)
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(2)
    expect(schema.mainEntity[0].name).toBe('Is it waterproof?')
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('Yes, IPX4 rated.')
  })
})

describe('categoryListSchema', () => {
  it('generates ItemList with positions', () => {
    const schema = categoryListSchema([
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Audio', slug: 'audio' },
    ] as any)
    expect(schema['@type']).toBe('ItemList')
    expect(schema.itemListElement).toHaveLength(2)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].url).toContain('/category/audio')
  })
})

describe('faqHubSchema', () => {
  it('generates a CollectionPage with an ItemList of FAQ topic pages', () => {
    const schema = faqHubSchema([
      { slug: 'trustpilot', title: 'Trustpilot FAQ' },
      { slug: 'yelp', title: 'Yelp FAQ' },
    ] as any)
    expect(schema['@type']).toBe('CollectionPage')
    expect(schema.url).toContain('/faq')
    expect(schema.mainEntity['@type']).toBe('ItemList')
    expect(schema.mainEntity.numberOfItems).toBe(2)
    expect(schema.mainEntity.itemListElement).toHaveLength(2)
    expect(schema.mainEntity.itemListElement[0].position).toBe(1)
    expect(schema.mainEntity.itemListElement[0].name).toBe('Trustpilot FAQ')
    expect(schema.mainEntity.itemListElement[1].url).toContain('/faq/yelp')
  })
})

describe('productsHubSchema', () => {
  it('generates a CollectionPage with an ItemList of product money pages', () => {
    const schema = productsHubSchema([
      { name: 'S8 MaxV Ultra', slug: 'roborock-s8-maxv-ultra', brand: 'Roborock', categorySlug: 'robot-vacuums' },
      { name: 'Bot L10', slug: 'eufy-l10', brand: 'Eufy', categorySlug: 'robot-vacuums' },
    ] as any)
    expect(schema['@type']).toBe('CollectionPage')
    expect(schema.url).toContain('/products')
    expect(schema.mainEntity['@type']).toBe('ItemList')
    expect(schema.mainEntity.numberOfItems).toBe(2)
    expect(schema.mainEntity.itemListElement).toHaveLength(2)
    expect(schema.mainEntity.itemListElement[0].position).toBe(1)
    expect(schema.mainEntity.itemListElement[0].name).toBe('Roborock S8 MaxV Ultra')
    expect(schema.mainEntity.itemListElement[0].url).toContain('/category/robot-vacuums/roborock-s8-maxv-ultra')
  })
})

describe('profilePageSchema', () => {
  const user = {
    id: 'u1',
    username: 'janedoe',
    displayName: 'Jane Doe',
    bio: 'Verified reviewer of audio gear.',
    trustLevel: 'trusted',
    reputationScore: 1200,
    badges: [],
    expertiseCategories: ['headphones', 'wireless-earbuds'],
    verifiedProductCount: 8,
    reviewCount: 12,
    commentCount: 30,
    threadCount: 5,
    helpfulVotesReceived: 89,
    joinedAt: '2025-01-10',
    lastActiveAt: '2026-07-01',
  } as any

  it('generates a ProfilePage with a Person mainEntity and required dates', () => {
    const schema = profilePageSchema(user) as Record<string, any>
    expect(schema['@type']).toBe('ProfilePage')
    expect(schema.url).toContain('/community/user/janedoe')
    expect(schema.dateCreated).toBe('2025-01-10')
    expect(schema.dateModified).toBe('2026-07-01')
    expect(schema.mainEntity['@type']).toBe('Person')
    expect(schema.mainEntity.name).toBe('Jane Doe')
    expect(schema.mainEntity.alternateName).toBe('@janedoe')
  })

  it('counts authored content in agentInteractionStatistic and votes in interactionStatistic', () => {
    const schema = profilePageSchema(user) as Record<string, any>
    // reviews + comments + threads = 12 + 30 + 5
    expect(schema.mainEntity.agentInteractionStatistic[0].userInteractionCount).toBe(47)
    expect(schema.mainEntity.agentInteractionStatistic[0].interactionType).toContain('WriteAction')
    expect(schema.mainEntity.interactionStatistic[0].userInteractionCount).toBe(89)
    expect(schema.mainEntity.interactionStatistic[0].interactionType).toContain('LikeAction')
  })

  it('maps expertise categories into knowsAbout with hyphens humanized', () => {
    const schema = profilePageSchema(user) as Record<string, any>
    expect(schema.mainEntity.knowsAbout).toContain('wireless earbuds')
  })
})

describe('videoObjectSchema', () => {
  it('generates VideoObject with YouTube URLs', () => {
    const schema = videoObjectSchema(
      { id: 'abc123', title: 'Sony Review' } as any,
      'Sony WH-1000XM5'
    )
    expect(schema['@type']).toBe('VideoObject')
    expect(schema.contentUrl).toContain('youtube.com/watch?v=abc123')
    expect(schema.embedUrl).toContain('youtube.com/embed/abc123')
    expect(schema.thumbnailUrl).toContain('abc123')
  })
})

describe('videoObjectListSchema', () => {
  it('maps active videos to VideoObject nodes', () => {
    const list = videoObjectListSchema(
      [
        { id: 'a1', title: 'First' },
        { id: 'b2', title: 'Second' },
      ] as any,
      'Sony WH-1000XM5'
    )
    expect(list).toHaveLength(2)
    expect(list.every((v) => v['@type'] === 'VideoObject')).toBe(true)
    expect(list[0].contentUrl).toContain('a1')
  })

  it('drops videos explicitly marked inactive so no empty node is emitted', () => {
    const list = videoObjectListSchema(
      [
        { id: 'a1', title: 'Active' },
        { id: 'b2', title: 'Inactive', isActive: false },
      ] as any,
      'Sony WH-1000XM5'
    )
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Active')
  })
})

describe('comparisonSchema', () => {
  const mkProduct = (over: Record<string, any> = {}) =>
    ({
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      categorySlug: 'headphones',
      brand: 'Sony',
      description: 'Noise canceling headphones',
      priceRange: { min: 300, max: 400, currency: 'USD' },
      reviewCount: 10,
      reviews: [{ rating: 5, headline: 'Great', body: 'Excellent', authorName: 'U', createdAt: '2025-01-01' }],
      createdAt: '2025-01-01',
      updatedAt: '2025-02-01',
      ...over,
    } as any)

  it('nests each Product item with a valid image and canonical url', () => {
    const schema = comparisonSchema(
      mkProduct(),
      mkProduct({ name: 'Bose QC45', slug: 'bose-qc45' })
    ) as Record<string, any>
    const items = schema.mainEntity.itemListElement
    expect(items).toHaveLength(2)
    for (const li of items) {
      const p = li.item
      expect(p['@type']).toBe('Product')
      // image must resolve to the generated OG card, not a 404 raw image path
      expect(p.image).toContain('/opengraph-image')
      expect(p.image).toContain(`/category/${p.url.split('/category/')[1]}`)
      expect(p.url).toContain('/category/')
      // aggregateRating requires a valid image to render the rich result
      expect(p.aggregateRating).toBeDefined()
    }
  })
})

describe('analysisAuthorSchema', () => {
  it('returns valid Person schema', () => {
    const schema = analysisAuthorSchema()
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toContain('ReviewIQ')
    expect(schema.worksFor['@type']).toBe('Organization')
  })
})

describe('speakableSchema', () => {
  it('returns a WebPage that names the analysis author for E-E-A-T', () => {
    const schema = speakableSchema('Acme Widget', '/category/widgets/acme-widget') as Record<string, any>
    expect(schema['@type']).toBe('WebPage')
    expect(schema.author['@type']).toBe('Person')
    expect(schema.author.name).toContain('ReviewIQ')
    // nested author must not carry its own @context (only the root node does)
    expect(schema.author['@context']).toBeUndefined()
    expect(schema.speakable['@type']).toBe('SpeakableSpecification')
  })
})

describe('blogPostSchema', () => {
  const basePost = {
    slug: 'best-mattress-for-back-pain-2026',
    title: 'Best Mattress for Back Pain (2026)',
    publishedAt: '2026-01-01',
    updatedAt: '2026-02-01',
    author: { name: 'ReviewIQ Team' },
    seo: { metaDescription: 'Our picks', focusKeyword: 'mattress', secondaryKeywords: ['back pain'] },
  } as any

  it('falls back to the absolute OG route when coverImage is a relative path (404 in prod)', () => {
    const schema = blogPostSchema({ ...basePost, coverImage: '/images/blog/best-mattress-back-pain.jpg' }) as Record<string, any>
    expect(schema.image).toBe('https://revieweriq.com/blog/best-mattress-for-back-pain-2026/opengraph-image')
    expect(schema.image.startsWith('http')).toBe(true)
  })

  it('falls back to the OG route when coverImage is missing', () => {
    const schema = blogPostSchema({ ...basePost, coverImage: undefined }) as Record<string, any>
    expect(schema.image).toBe('https://revieweriq.com/blog/best-mattress-for-back-pain-2026/opengraph-image')
  })

  it('keeps coverImage when it is a real absolute URL', () => {
    const abs = 'https://cdn.example.com/cover.jpg'
    const schema = blogPostSchema({ ...basePost, coverImage: abs }) as Record<string, any>
    expect(schema.image).toBe(abs)
  })

  it('never emits a relative or protocol-less image', () => {
    for (const cover of ['/images/blog/x.jpg', '', undefined, 'images/blog/x.jpg']) {
      const schema = blogPostSchema({ ...basePost, coverImage: cover }) as Record<string, any>
      expect(/^https?:\/\//.test(schema.image)).toBe(true)
    }
  })
})

describe('communityThreadSchema', () => {
  const baseThread: DiscussionThread = {
    id: 'thread-x',
    title: 'Is the Roborock S8 worth it?',
    body: 'Considering the S8 MaxV Ultra. Anyone regret the price?',
    threadType: 'question',
    authorId: 'u1',
    upvotes: 12,
    downvotes: 1,
    commentCount: 2,
    viewCount: 340,
    isPinned: false,
    isResolved: true,
    tags: ['robot-vacuums'],
    createdAt: '2026-02-18',
    lastActivityAt: '2026-03-13',
  }
  const mkComment = (over: Partial<Comment>): Comment => ({
    id: 'c1',
    threadId: 'thread-x',
    authorId: 'u2',
    body: 'Yes, worth it.',
    upvotes: 5,
    downvotes: 0,
    isTopAnswer: false,
    isOwnerVerified: false,
    helpfulCount: 0,
    createdAt: '2026-02-19',
    ...over,
  })
  const names: Record<string, string> = { u1: 'Sarah K.', u2: 'Marcus T.', u3: 'Jess L.' }
  const resolve = (id: string) => names[id] || ''

  it('emits QAPage for question threads with at least one answer', () => {
    const schema = communityThreadSchema(
      baseThread,
      [mkComment({ id: 'c1', upvotes: 3 }), mkComment({ id: 'c2', authorId: 'u3', upvotes: 9 })],
      resolve
    ) as Record<string, any>
    expect(schema['@type']).toBe('QAPage')
    expect(schema.mainEntity['@type']).toBe('Question')
    expect(schema.mainEntity.answerCount).toBe(2)
    expect(schema.mainEntity.author.name).toBe('Sarah K.')
  })

  it('picks the highest-voted reply as acceptedAnswer when none is flagged top', () => {
    const schema = communityThreadSchema(
      baseThread,
      [mkComment({ id: 'c1', upvotes: 3 }), mkComment({ id: 'c2', upvotes: 9 })],
      resolve
    ) as Record<string, any>
    expect(schema.mainEntity.acceptedAnswer.url).toContain('#comment-c2')
    expect(schema.mainEntity.suggestedAnswer).toHaveLength(1)
  })

  it('prefers a human-flagged top answer over vote count', () => {
    const schema = communityThreadSchema(
      baseThread,
      [mkComment({ id: 'c1', upvotes: 3, isTopAnswer: true }), mkComment({ id: 'c2', upvotes: 9 })],
      resolve
    ) as Record<string, any>
    expect(schema.mainEntity.acceptedAnswer.url).toContain('#comment-c1')
  })

  it('flattens nested replies into answer nodes', () => {
    const parent = mkComment({ id: 'c1', replies: [mkComment({ id: 'c1r', authorId: 'u3' })] })
    const schema = communityThreadSchema(baseThread, [parent], resolve) as Record<string, any>
    expect(schema.mainEntity.answerCount).toBe(2)
  })

  it('falls back to DiscussionForumPosting for a question with no answers', () => {
    const schema = communityThreadSchema(baseThread, [], resolve) as Record<string, any>
    expect(schema['@type']).toBe('DiscussionForumPosting')
    expect(schema.interactionStatistic).toHaveLength(3)
    expect(schema.comment).toBeUndefined()
  })

  it('emits DiscussionForumPosting with comments for non-question threads', () => {
    const schema = communityThreadSchema(
      { ...baseThread, threadType: 'discussion' },
      [mkComment({ id: 'c1' })],
      resolve
    ) as Record<string, any>
    expect(schema['@type']).toBe('DiscussionForumPosting')
    expect(schema.comment).toHaveLength(1)
    expect(schema.comment[0]['@type']).toBe('Comment')
    expect(schema.author.name).toBe('Sarah K.')
  })

  it('falls back to a generic author name when the user is unknown', () => {
    const schema = communityThreadSchema(
      { ...baseThread, authorId: 'ghost', threadType: 'tip' },
      [],
      resolve
    ) as Record<string, any>
    expect(schema.author.name).toBe('Community Member')
  })
})

describe('whereToBuySchema', () => {
  const product = {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    categorySlug: 'wireless-earbuds',
    brand: 'Sony',
    description: 'Noise canceling headphones',
    priceRange: { min: 300, max: 400, currency: 'USD' },
    reviewCount: 10,
    reviews: [
      { rating: 5, headline: 'Great', body: 'Excellent', authorName: 'User1', createdAt: '2025-01-01' },
      { rating: 4, headline: 'Good', body: 'Nice', authorName: 'User2', createdAt: '2025-01-02' },
    ],
  } as any

  const offers = [
    { merchantSlug: 'amazon', merchantName: 'Amazon', url: 'https://amazon.com/x', price: 329, currency: 'USD', isFirstParty: false },
    { merchantSlug: 'sony', merchantName: 'Sony', url: 'https://sony.com/x', price: 399, currency: 'USD', isFirstParty: true },
  ] as any

  it('returns null with no live offers, so an empty page never claims prices', () => {
    expect(whereToBuySchema(product, [])).toBeNull()
  })

  it('emits one Offer per live merchant, priced exactly as rendered', () => {
    const schema = whereToBuySchema(product, offers) as Record<string, any>
    expect(schema['@type']).toBe('Product')
    expect(schema.offers).toHaveLength(2)
    expect(schema.offers.map((o: any) => o.price)).toEqual([329, 399])
    expect(schema.offers.map((o: any) => o.seller.name)).toEqual(['Amazon', 'Sony'])
    expect(schema.offers[0]['@type']).toBe('Offer')
    expect(schema.offers[0].priceCurrency).toBe('USD')
    expect(schema.offers[0].url).toBe('https://amazon.com/x')
  })

  it('never derives marked-up prices from priceRange', () => {
    const schema = whereToBuySchema(product, offers) as Record<string, any>
    const prices = JSON.stringify(schema.offers)
    expect(prices).not.toContain('300')
    expect(prices).not.toContain('400')
  })

  it('points url at the where-to-buy page and carries the product rating', () => {
    const schema = whereToBuySchema(product, offers) as Record<string, any>
    expect(schema.url).toContain('/category/wireless-earbuds/sony-wh-1000xm5/where-to-buy')
    expect(schema.aggregateRating.ratingValue).toBe('4.5')
  })
})
