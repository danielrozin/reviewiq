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
  analysisAuthorSchema,
} from '../schema/jsonld'

describe('organizationSchema', () => {
  it('returns valid Organization schema', () => {
    const schema = organizationSchema()
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('ReviewIQ')
    expect(schema.url).toBeDefined()
  })
})

describe('websiteSchema', () => {
  it('returns valid WebSite schema with search action', () => {
    const schema = websiteSchema()
    expect(schema['@type']).toBe('WebSite')
    expect(schema.potentialAction['@type']).toBe('SearchAction')
    expect(schema.potentialAction.target).toContain('{search_term_string}')
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
    const schema = productSchema(mockProduct)
    expect(schema.aggregateRating.ratingValue).toBe('4.5')
    expect(schema.aggregateRating.reviewCount).toBe(10)
  })

  it('omits aggregateRating and review when product has no reviews', () => {
    const noReviewProduct = { ...mockProduct, reviews: [], reviewCount: 0 }
    const schema = productSchema(noReviewProduct)
    expect(schema.aggregateRating).toBeUndefined()
    expect(schema.review).toBeUndefined()
  })

  it('includes price range and offerCount in offers', () => {
    const schema = productSchema(mockProduct)
    expect(schema.offers.lowPrice).toBe(300)
    expect(schema.offers.highPrice).toBe(400)
    expect(schema.offers.priceCurrency).toBe('USD')
    expect(schema.offers.offerCount).toBeGreaterThanOrEqual(1)
  })

  it('omits offers when price range is invalid', () => {
    const noPriceProduct = { ...mockProduct, priceRange: { min: 0, max: 0, currency: 'USD' } }
    const schema = productSchema(noPriceProduct)
    expect(schema.offers).toBeUndefined()
  })

  it('limits review output to 5', () => {
    const manyReviews = Array(10).fill(mockProduct.reviews[0])
    const schema = productSchema({ ...mockProduct, reviews: manyReviews })
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

describe('analysisAuthorSchema', () => {
  it('returns valid Person schema', () => {
    const schema = analysisAuthorSchema()
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toContain('ReviewIQ')
    expect(schema.worksFor['@type']).toBe('Organization')
  })
})
