/**
 * Tests for /api/subscribe route — email subscription idempotency.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  emailSubscription: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST } from '../subscribe/route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest(new URL('/api/subscribe', 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validSub = {
  email: 'test@example.com',
  productId: 'p1',
  productSlug: 'test-product',
  productName: 'Test Product',
}

describe('POST /api/subscribe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects invalid email', async () => {
    const res = await POST(makeRequest({ ...validSub, email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('rejects missing productId', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', productSlug: 's', productName: 'n' }))
    expect(res.status).toBe(400)
  })

  it('creates new subscription successfully', async () => {
    mockPrisma.emailSubscription.findUnique.mockResolvedValue(null)
    mockPrisma.emailSubscription.create.mockResolvedValue({ id: 's1' })

    const res = await POST(makeRequest(validSub))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.alreadySubscribed).toBeUndefined()
  })

  it('returns alreadySubscribed for active existing subscription', async () => {
    mockPrisma.emailSubscription.findUnique.mockResolvedValue({
      id: 's1',
      unsubscribedAt: null,
    })

    const res = await POST(makeRequest(validSub))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.alreadySubscribed).toBe(true)
  })

  it('reactivates unsubscribed subscription', async () => {
    mockPrisma.emailSubscription.findUnique.mockResolvedValue({
      id: 's1',
      unsubscribedAt: new Date(),
    })
    mockPrisma.emailSubscription.update.mockResolvedValue({ id: 's1' })

    const res = await POST(makeRequest(validSub))
    expect(res.status).toBe(200)

    expect(mockPrisma.emailSubscription.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { unsubscribedAt: null },
    })
  })

  it('does not call create when already subscribed', async () => {
    mockPrisma.emailSubscription.findUnique.mockResolvedValue({
      id: 's1',
      unsubscribedAt: null,
    })

    await POST(makeRequest(validSub))
    expect(mockPrisma.emailSubscription.create).not.toHaveBeenCalled()
  })
})
