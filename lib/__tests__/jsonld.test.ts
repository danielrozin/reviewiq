/**
 * Tests for lib/schema/jsonld.ts — SEO structured data generation.
 */
import { describe, it, expect } from 'vitest'
import {
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  productSchema,
  reviewSchema,
  faqSchema,
  categoryListSchema,
  videoObjectSchema,
  videoObjectListSchema,
  analysisAuthorSchema,
  comparisonSchema,
  blogPostSchema,
} from '../schema/jsonld'

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

  it('calculates average rating correctly', () => {
    const schema = productSchema(mockProduct) as Record<string, any>
    expect(schema.aggregateRating.ratingValue).toBe('4.5')
    expect(schema.aggregateRating.reviewCount).toBe(10)
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
