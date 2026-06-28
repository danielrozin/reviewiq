/**
 * Tests for /api/surveys route — survey submission and retrieval.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  smartreviewSurvey: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    findFirst: vi.fn(),
  },
}))

const mockNotify = vi.hoisted(() => ({ notifyNewFeedback: vi.fn(() => Promise.resolve()) }))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/lib/email/notify-feedback', () => mockNotify)

import { POST, GET } from '../surveys/route'

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest(new URL('/api/surveys', 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const TEST_TOKEN = 'test-survey-token'

function makeGetRequest(query = '', auth: string | null = `Bearer ${TEST_TOKEN}`): NextRequest {
  return new NextRequest(new URL(`/api/surveys${query}`, 'http://localhost:3000'), {
    headers: auth ? { authorization: auth } : {},
  })
}

describe('POST /api/surveys', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates survey with empty body (all optional)', async () => {
    mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 's1' })

    const res = await POST(makePostRequest({}))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBe('s1')
  })

  it('creates survey with all fields populated', async () => {
    mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 's2' })

    const res = await POST(makePostRequest({
      userType: 'buyer',
      actionType: 'review',
      category: 'electronics',
      reviewCompletionTimeSec: 120,
      formFieldsFilled: 5,
      surveyCompleted: true,
      q1Intent: 'research',
      q2Found: true,
      q3Rating: 4,
      q4Improvement: 'More filters',
      q5Discovery: 'google',
      deviceType: 'mobile',
      referralSource: 'search',
      optInEmail: 'user@example.com',
    }))
    expect(res.status).toBe(201)
  })

  it('rejects q3Rating below 1', async () => {
    const res = await POST(makePostRequest({ q3Rating: 0 }))
    expect(res.status).toBe(400)
  })

  it('rejects q3Rating above 5', async () => {
    const res = await POST(makePostRequest({ q3Rating: 6 }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await POST(makePostRequest({ optInEmail: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('rejects negative reviewCompletionTimeSec', async () => {
    const res = await POST(makePostRequest({ reviewCompletionTimeSec: -5 }))
    expect(res.status).toBe(400)
  })

  it('persists a form_abandon event with the reached step (DAN-699)', async () => {
    mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 'a1' })

    const res = await POST(makePostRequest({
      event: 'form_abandon',
      reachedStep: 'q2',
      surveyCompleted: false,
      q1Intent: 'comparing',
      deviceType: 'mobile',
      userAgent: 'Mozilla/5.0 (iPhone)',
      referralSource: 'https://aversusb.net/iphone-vs-pixel',
    }))

    expect(res.status).toBe(201)
    expect(mockPrisma.smartreviewSurvey.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          event: 'form_abandon',
          reachedStep: 'q2',
          surveyCompleted: false,
          userAgent: 'Mozilla/5.0 (iPhone)',
        }),
      })
    )
  })

  it('does NOT send a feedback email for form_abandon events', async () => {
    mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 'a2' })

    await POST(makePostRequest({ event: 'form_abandon', reachedStep: 'q1' }))

    expect(mockNotify.notifyNewFeedback).not.toHaveBeenCalled()
  })

  it('sends a feedback email for a completed submission', async () => {
    mockPrisma.smartreviewSurvey.create.mockResolvedValue({ id: 's3' })

    await POST(makePostRequest({ surveyCompleted: true, q3Rating: 5 }))

    expect(mockNotify.notifyNewFeedback).toHaveBeenCalledTimes(1)
  })
})

describe('GET /api/surveys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SURVEY_ADMIN_TOKEN = TEST_TOKEN
    // Aggregate query defaults so the route doesn't throw under mock.
    mockPrisma.smartreviewSurvey.findMany.mockResolvedValue([])
    mockPrisma.smartreviewSurvey.count.mockResolvedValue(0)
    mockPrisma.smartreviewSurvey.groupBy.mockResolvedValue([])
    mockPrisma.smartreviewSurvey.findFirst.mockResolvedValue(null)
  })

  it('returns 401 without a bearer token', async () => {
    const res = await GET(makeGetRequest('', null))
    expect(res.status).toBe(401)
    expect(mockPrisma.smartreviewSurvey.findMany).not.toHaveBeenCalled()
  })

  it('returns 401 with a wrong bearer token', async () => {
    const res = await GET(makeGetRequest('', 'Bearer nope'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when SURVEY_ADMIN_TOKEN is unset (fail closed)', async () => {
    delete process.env.SURVEY_ADMIN_TOKEN
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns paginated surveys + aggregate with a valid token', async () => {
    mockPrisma.smartreviewSurvey.count
      .mockResolvedValueOnce(3) // filtered total
      .mockResolvedValueOnce(10) // grandTotal
      .mockResolvedValueOnce(4) // completions
    mockPrisma.smartreviewSurvey.groupBy
      .mockResolvedValueOnce([
        { event: 'impression', _count: { _all: 8 } },
        { event: 'dismissed', _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([{ q1Intent: 'research', _count: { _all: 5 } }])
    mockPrisma.smartreviewSurvey.findFirst.mockResolvedValue({ createdAt: new Date('2026-06-01') })

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('surveys')
    expect(data).toHaveProperty('total')
    expect(data.aggregate).toMatchObject({
      totalRows: 10,
      impressions: 8,
      completions: 4,
      dismissals: 2,
      q1IntentBreakdown: { research: 5 },
      funnelConversionRate: 0.5,
    })
  })

  it('caps limit at 200', async () => {
    await GET(makeGetRequest('?limit=500'))

    expect(mockPrisma.smartreviewSurvey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    )
  })

  it('filters by category', async () => {
    await GET(makeGetRequest('?category=electronics'))

    expect(mockPrisma.smartreviewSurvey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'electronics' }),
      })
    )
  })

  it('filters by surveyCompleted boolean', async () => {
    await GET(makeGetRequest('?surveyCompleted=true'))

    expect(mockPrisma.smartreviewSurvey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ surveyCompleted: true }),
      })
    )
  })
})
