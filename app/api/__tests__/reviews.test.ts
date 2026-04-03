/**
 * Tests for POST and GET /api/reviews route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  review: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/lib/rate-limit', () => ({
  reviewLimiter: {
    check: vi.fn().mockReturnValue({ success: true, reset: Date.now() + 60000 }),
  },
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeReviewContent: vi.fn((text: string) => text),
}))

import { POST, GET } from '../reviews/route'

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init)
}

const validReview = {
  productId: 'p1',
  userId: 'u1',
  headline: 'Great Product',
  rating: 5,
  body: 'I really love this product, highly recommended!',
}

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields with Zod schema', async () => {
    const req = makeRequest('POST', '/api/reviews', { productId: 'p1' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('rejects headline shorter than 3 characters', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, headline: 'Hi' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects headline longer than 200 characters', async () => {
    const req = makeRequest('POST', '/api/reviews', {
      ...validReview,
      headline: 'A'.repeat(201),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects rating outside 1-5 range', async () => {
    const req0 = makeRequest('POST', '/api/reviews', { ...validReview, rating: 0 })
    expect((await POST(req0)).status).toBe(400)

    const req6 = makeRequest('POST', '/api/reviews', { ...validReview, rating: 6 })
    expect((await POST(req6)).status).toBe(400)
  })

  it('rejects body shorter than 10 characters', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, body: 'Short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when product does not exist', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)

    const req = makeRequest('POST', '/api/reviews', validReview)
    const res = await POST(req)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('Product not found')
  })

  it('creates review and increments product reviewCount', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' })
    mockPrisma.review.create.mockResolvedValue({
      id: 'r1',
      ...validReview,
      user: { id: 'u1', name: 'Test', image: null },
    })
    mockPrisma.product.update.mockResolvedValue({})

    const req = makeRequest('POST', '/api/reviews', validReview)
    const res = await POST(req)
    expect(res.status).toBe(201)

    expect(mockPrisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productId: 'p1',
          userId: 'u1',
          headline: 'Great Product',
          rating: 5,
        }),
      })
    )
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { reviewCount: { increment: 1 } },
    })
  })
})

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated reviews with defaults', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('reviews')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('limit')
  })

  it('filters by productId when provided', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews?productId=p1')
    await GET(req)

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productId: 'p1' }),
      })
    )
  })

  it('sorts by helpful count when sort=helpful', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews?sort=helpful')
    await GET(req)

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { helpfulCount: 'desc' },
      })
    )
  })

  it('sorts by rating when sort=rating', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews?sort=rating')
    await GET(req)

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { rating: 'desc' },
      })
    )
  })

  it('defaults to sorting by createdAt', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews')
    await GET(req)

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('caps limit at 50', async () => {
    mockPrisma.review.findMany.mockResolvedValue([])
    mockPrisma.review.count.mockResolvedValue(0)

    const req = makeRequest('GET', '/api/reviews?limit=100')
    await GET(req)

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    )
  })
})
