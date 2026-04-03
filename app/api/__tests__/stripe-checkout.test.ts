/**
 * Tests for POST /api/stripe/checkout route.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  subscription: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}))

const mockStripe = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
}))

const mockGetServerSession = vi.hoisted(() => vi.fn())

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: () => mockStripe,
  PLANS: {
    pro: { stripePriceId: 'price_pro_test' },
    free: { stripePriceId: null },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

import { POST } from '../stripe/checkout/route'

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session exists', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const res = await POST()
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when session has no email', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'u1' } })

    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('creates Stripe customer and subscription when none exists', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
    })
    mockPrisma.subscription.findUnique.mockResolvedValue(null)
    mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' })
    mockPrisma.subscription.create.mockResolvedValue({
      userId: 'u1',
      stripeCustomerId: 'cus_new',
      plan: 'free',
      status: 'inactive',
    })
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_123',
    })

    const res = await POST()
    expect(res.status).toBe(200)

    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      metadata: { userId: 'u1' },
    })
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        stripeCustomerId: 'cus_new',
        plan: 'free',
        status: 'inactive',
      },
    })
  })

  it('creates checkout session for non-subscribed user', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
    })
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
      status: 'inactive',
      plan: 'free',
    })
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_456',
    })

    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/session_456')

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing',
        mode: 'subscription',
        metadata: { userId: 'u1' },
      })
    )
  })

  it('redirects to billing portal if already subscribed to pro', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
    })
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
      status: 'active',
      plan: 'pro',
    })
    mockStripe.billingPortal.sessions.create.mockResolvedValue({
      url: 'https://billing.stripe.com/portal_789',
    })

    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://billing.stripe.com/portal_789')

    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'cus_existing',
      })
    )
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('creates checkout session when subscription is active but plan is free', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
    })
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
      status: 'active',
      plan: 'free',
    })
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_free',
    })

    const res = await POST()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/session_free')

    expect(mockStripe.billingPortal.sessions.create).not.toHaveBeenCalled()
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
  })

  it('does not create Stripe customer when customerId already exists', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' },
    })
    mockPrisma.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_already',
      status: 'inactive',
      plan: 'free',
    })
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session_existing',
    })

    await POST()

    expect(mockStripe.customers.create).not.toHaveBeenCalled()
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
  })
})
