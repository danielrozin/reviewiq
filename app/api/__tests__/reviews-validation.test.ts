/**
 * Tests for /api/reviews route validation logic (Zod-based).
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
  reviewLimiter: { check: () => ({ success: true, remaining: 99, reset: Date.now() + 3600000 }) },
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeReviewContent: (s: string) => s,
}))

import { POST, GET } from '../reviews/route'

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as ConstructorParameters<typeof NextRequest>[1])
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

  it('rejects request with missing required fields', async () => {
    const req = makeRequest('POST', '/api/reviews', { productId: 'p1' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('rejects rating below 1', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, rating: 0 })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects rating above 5', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, rating: 6 })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects headline shorter than 3 chars', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, headline: 'Hi' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects body shorter than 10 chars', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, body: 'Short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)
    const req = makeRequest('POST', '/api/reviews', validReview)
    const res = await POST(req)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('Product not found')
  })

  it('creates review successfully with valid data', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' })
    mockPrisma.review.create.mockResolvedValue({
      id: 'r1',
      ...validReview,
      status: 'pending',
      user: { id: 'u1', name: 'Test', image: null },
    })
    mockPrisma.product.update.mockResolvedValue({})

    const req = makeRequest('POST', '/api/reviews', validReview)
    const res = await POST(req)
    expect(res.status).toBe(201)

    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { reviewCount: { increment: 1 } },
      })
    )
  })

  it('rejects non-integer rating', async () => {
    const req = makeRequest('POST', '/api/reviews', { ...validReview, rating: 3.5 })
    const res = await POST(req)
    expect(res.status).toBe(400)
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
