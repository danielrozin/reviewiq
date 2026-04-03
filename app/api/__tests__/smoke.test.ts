/**
 * Smoke test suite — runs before each deployment to verify core routes respond correctly.
 *
 * These tests verify that:
 * - All API route handlers are importable and callable
 * - Validation rejects obviously bad input
 * - Happy-path requests return expected status codes
 * - No runtime import errors or missing dependencies
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// === Mock Prisma for all routes ===
const mockPrisma = vi.hoisted(() => ({
  product: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), update: vi.fn() },
  review: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), aggregate: vi.fn(), update: vi.fn() },
  vote: { findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
  discussionThread: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), update: vi.fn() },
  comment: { create: vi.fn(), findMany: vi.fn(), count: vi.fn(), update: vi.fn() },
  moderationReport: { findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
  emailSubscription: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  consentRecord: { create: vi.fn(), findFirst: vi.fn() },
  smartreviewSurvey: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/db/prisma', () => ({ prisma: mockPrisma }))

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method }
  if (body) {
    init.body = JSON.stringify(body)
    init.headers = { 'Content-Type': 'application/json' }
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init)
}

describe('Smoke Tests — API Route Health', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET /api/search', () => {
    it('responds 200 with empty query', async () => {
      const { GET } = await import('../search/route')
      const res = await GET(makeRequest('GET', '/api/search'))
      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/reviews', () => {
    it('responds 200 with default params', async () => {
      mockPrisma.review.findMany.mockResolvedValue([])
      mockPrisma.review.count.mockResolvedValue(0)

      const { GET } = await import('../reviews/route')
      const res = await GET(makeRequest('GET', '/api/reviews'))
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/reviews — validation gate', () => {
    it('rejects empty body with 400', async () => {
      const { POST } = await import('../reviews/route')
      const res = await POST(makeRequest('POST', '/api/reviews', {}))
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/vote — validation gate', () => {
    it('rejects empty body with 400', async () => {
      const { POST } = await import('../vote/route')
      const res = await POST(makeRequest('POST', '/api/vote', {}))
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/moderation — validation gate', () => {
    it('rejects empty body with 400', async () => {
      const { POST } = await import('../moderation/route')
      const res = await POST(makeRequest('POST', '/api/moderation', {}))
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/subscribe — validation gate', () => {
    it('rejects empty body with 400', async () => {
      const { POST } = await import('../subscribe/route')
      const res = await POST(makeRequest('POST', '/api/subscribe', {}))
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/surveys — accepts empty body', () => {
    it('responds 201 (all fields optional)', async () => {
      mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 'smoke-test' })

      const { POST } = await import('../surveys/route')
      const res = await POST(makeRequest('POST', '/api/surveys', {}))
      expect(res.status).toBe(201)
    })
  })

  describe('GET /api/surveys', () => {
    it('responds 200 with defaults', async () => {
      mockPrisma.smartreviewSurvey.findMany.mockResolvedValue([])
      mockPrisma.smartreviewSurvey.count.mockResolvedValue(0)

      const { GET } = await import('../surveys/route')
      const res = await GET(makeRequest('GET', '/api/surveys'))
      expect(res.status).toBe(200)
    })
  })

  describe('POST /api/discussions/thread — validation gate', () => {
    it('rejects empty body with 400', async () => {
      const { POST } = await import('../discussions/thread/route')
      const res = await POST(makeRequest('POST', '/api/discussions/thread', {}))
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/discussions/thread', () => {
    it('responds 200 with defaults', async () => {
      mockPrisma.discussionThread.findMany.mockResolvedValue([])
      mockPrisma.discussionThread.count.mockResolvedValue(0)

      const { GET } = await import('../discussions/thread/route')
      const res = await GET(makeRequest('GET', '/api/discussions/thread'))
      expect(res.status).toBe(200)
    })
  })
})

describe('Smoke Tests — Lib Imports', () => {
  it('lib/utils exports all expected functions', async () => {
    const utils = await import('@/lib/utils')
    expect(typeof utils.cn).toBe('function')
    expect(typeof utils.formatNumber).toBe('function')
    expect(typeof utils.getScoreColor).toBe('function')
    expect(typeof utils.getScoreBgColor).toBe('function')
    expect(typeof utils.getScoreLabel).toBe('function')
  })

  it('lib/consent exports all expected functions', async () => {
    const consent = await import('@/lib/consent')
    expect(typeof consent.isEuEea).toBe('function')
    expect(typeof consent.hashIp).toBe('function')
    expect(typeof consent.toGoogleConsentMode).toBe('function')
    expect(typeof consent.defaultConsentForRegion).toBe('function')
    expect(consent.CURRENT_POLICY_VERSION).toBeDefined()
  })

  it('lib/schema/jsonld exports all schema generators', async () => {
    const jsonld = await import('@/lib/schema/jsonld')
    expect(typeof jsonld.organizationSchema).toBe('function')
    expect(typeof jsonld.websiteSchema).toBe('function')
    expect(typeof jsonld.breadcrumbSchema).toBe('function')
    expect(typeof jsonld.productSchema).toBe('function')
    expect(typeof jsonld.faqSchema).toBe('function')
  })
})
