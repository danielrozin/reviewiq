/**
 * Tests for GET /api/products route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  review: {
    aggregate: vi.fn(),
  },
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}))

import { GET } from '../products/route'

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'))
}

const sampleProduct = {
  id: 'p1',
  name: 'Test Product',
  smartScore: 85,
  categoryId: 'cat1',
  category: { name: 'Electronics', slug: 'electronics' },
  _count: { reviews: 5 },
}

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated products with defaults', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct])
    mockPrisma.product.count.mockResolvedValue(1)
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.2 } })

    const res = await GET(makeRequest('/api/products'))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data).toHaveProperty('products')
    expect(data).toHaveProperty('total', 1)
    expect(data).toHaveProperty('page', 1)
    expect(data).toHaveProperty('limit', 20)
  })

  it('filters by categoryId when provided', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await GET(makeRequest('/api/products?categoryId=cat1'))

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: 'cat1' },
      })
    )
    expect(mockPrisma.product.count).toHaveBeenCalledWith({
      where: { categoryId: 'cat1' },
    })
  })

  it('orders by smartScore descending', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await GET(makeRequest('/api/products'))

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { smartScore: 'desc' },
      })
    )
  })

  it('includes category and review count', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await GET(makeRequest('/api/products'))

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      })
    )
  })

  it('respects page and limit params', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await GET(makeRequest('/api/products?page=3&limit=10'))

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    )
  })

  it('computes averageRating from review aggregate', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProduct])
    mockPrisma.product.count.mockResolvedValue(1)
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } })

    const res = await GET(makeRequest('/api/products'))
    const data = await res.json()

    expect(data.products[0].averageRating).toBe(4.5)
    expect(data.products[0].reviewCount).toBe(5)
    expect(mockPrisma.review.aggregate).toHaveBeenCalledWith({
      where: { productId: 'p1' },
      _avg: { rating: true },
    })
  })

  it('returns 0 averageRating when no reviews exist', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      { ...sampleProduct, _count: { reviews: 0 } },
    ])
    mockPrisma.product.count.mockResolvedValue(1)
    mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null } })

    const res = await GET(makeRequest('/api/products'))
    const data = await res.json()

    expect(data.products[0].averageRating).toBe(0)
  })
})
