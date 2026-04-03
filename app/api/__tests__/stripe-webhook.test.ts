/**
 * Tests for POST /api/stripe/webhook route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  subscription: {
    update: vi.fn(),
  },
}))

const mockStripe = vi.hoisted(() => ({
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: () => mockStripe,
}))

import { POST } from '../stripe/webhook/route'

function makeWebhookRequest(body: string, signature: string | null): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (signature) headers['stripe-signature'] = signature
  return new NextRequest(new URL('/api/stripe/webhook', 'http://localhost:3000'), {
    method: 'POST',
    body,
    headers,
  })
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = makeWebhookRequest('{}', null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing signature')
  })

  it('returns 400 when constructEvent throws (invalid signature)', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const req = makeWebhookRequest('{}', 'sig_invalid')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid signature')
  })

  it('handles checkout.session.completed event', async () => {
    const mockSub = {
      id: 'sub_123',
      items: {
        data: [
          {
            price: { id: 'price_pro' },
            current_period_start: 1700000000,
            current_period_end: 1702592000,
          },
        ],
      },
      cancel_at_period_end: false,
    }

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          subscription: 'sub_123',
          customer: 'cus_abc',
        },
      },
    })
    mockStripe.subscriptions.retrieve.mockResolvedValue(mockSub)
    mockPrisma.subscription.update.mockResolvedValue({})

    const req = makeWebhookRequest('body', 'sig_valid')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: expect.objectContaining({
        stripeSubscriptionId: 'sub_123',
        stripePriceId: 'price_pro',
        status: 'active',
        plan: 'pro',
        cancelAtPeriodEnd: false,
      }),
    })
  })

  it('handles customer.subscription.updated event with active status', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'active',
          items: {
            data: [
              {
                current_period_start: 1700000000,
                current_period_end: 1702592000,
              },
            ],
          },
          cancel_at_period_end: false,
        },
      },
    })
    mockPrisma.subscription.update.mockResolvedValue({})

    const req = makeWebhookRequest('body', 'sig_valid')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: expect.objectContaining({
        status: 'active',
        plan: 'pro',
      }),
    })
  })

  it('handles customer.subscription.deleted event', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_abc',
          items: {
            data: [
              {
                current_period_start: 1700000000,
                current_period_end: 1702592000,
              },
            ],
          },
          cancel_at_period_end: false,
        },
      },
    })
    mockPrisma.subscription.update.mockResolvedValue({})

    const req = makeWebhookRequest('body', 'sig_valid')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: {
        status: 'canceled',
        plan: 'free',
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
      },
    })
  })

  it('handles invoice.payment_failed event', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_abc',
        },
      },
    })
    mockPrisma.subscription.update.mockResolvedValue({})

    const req = makeWebhookRequest('body', 'sig_valid')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { status: 'past_due' },
    })
  })

  it('returns 200 for unhandled event types', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'some.unknown.event',
      data: { object: {} },
    })

    const req = makeWebhookRequest('body', 'sig_valid')
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.received).toBe(true)
  })
})
