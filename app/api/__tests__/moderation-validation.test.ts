/**
 * Tests for /api/moderation route — report creation, duplicate detection, auto-flag logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  moderationReport: {
    findFirst: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  review: { update: vi.fn() },
  discussionThread: { update: vi.fn() },
  comment: { update: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST } from '../moderation/route'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest(new URL('/api/moderation', 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validReport = {
  contentType: 'review',
  contentId: 'r1',
  reporterId: 'u1',
  reason: 'spam',
}

describe('POST /api/moderation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects missing required fields', async () => {
    const res = await POST(makeRequest({ contentType: 'review' }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid contentType', async () => {
    const res = await POST(makeRequest({ ...validReport, contentType: 'invalid' }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid reason', async () => {
    const res = await POST(makeRequest({ ...validReport, reason: 'invalid_reason' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate pending report', async () => {
    mockPrisma.moderationReport.findFirst.mockResolvedValue({ id: 'existing' })

    const res = await POST(makeRequest(validReport))
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toContain('already reported')
  })

  it('creates report successfully', async () => {
    mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
    mockPrisma.moderationReport.create.mockResolvedValue({ id: 'new-report', ...validReport })
    mockPrisma.moderationReport.count.mockResolvedValue(1)

    const res = await POST(makeRequest(validReport))
    expect(res.status).toBe(201)
  })

  it('auto-flags review when 3+ pending reports', async () => {
    mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
    mockPrisma.moderationReport.create.mockResolvedValue({ id: 'r3', ...validReport })
    mockPrisma.moderationReport.count.mockResolvedValue(3)
    mockPrisma.review.update.mockResolvedValue({})

    await POST(makeRequest(validReport))

    expect(mockPrisma.review.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'flagged' },
    })
  })

  it('auto-locks thread when 3+ pending reports', async () => {
    const threadReport = { ...validReport, contentType: 'thread', contentId: 't1' }
    mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
    mockPrisma.moderationReport.create.mockResolvedValue({ id: 'r3', ...threadReport })
    mockPrisma.moderationReport.count.mockResolvedValue(3)
    mockPrisma.discussionThread.update.mockResolvedValue({})

    await POST(makeRequest(threadReport))

    expect(mockPrisma.discussionThread.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'locked' },
    })
  })

  it('auto-flags comment when 3+ pending reports', async () => {
    const commentReport = { ...validReport, contentType: 'comment', contentId: 'c1' }
    mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
    mockPrisma.moderationReport.create.mockResolvedValue({ id: 'r3', ...commentReport })
    mockPrisma.moderationReport.count.mockResolvedValue(3)
    mockPrisma.comment.update.mockResolvedValue({})

    await POST(makeRequest(commentReport))

    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { status: 'flagged' },
    })
  })

  it('does NOT auto-flag with fewer than 3 reports', async () => {
    mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
    mockPrisma.moderationReport.create.mockResolvedValue({ id: 'r1', ...validReport })
    mockPrisma.moderationReport.count.mockResolvedValue(2)

    await POST(makeRequest(validReport))

    expect(mockPrisma.review.update).not.toHaveBeenCalled()
    expect(mockPrisma.discussionThread.update).not.toHaveBeenCalled()
    expect(mockPrisma.comment.update).not.toHaveBeenCalled()
  })

  it('accepts all valid reason types', async () => {
    const reasons = ['spam', 'fake_review', 'harassment', 'misinformation', 'off_topic', 'duplicate', 'self_promotion']
    for (const reason of reasons) {
      mockPrisma.moderationReport.findFirst.mockResolvedValue(null)
      mockPrisma.moderationReport.create.mockResolvedValue({ id: 'r1', ...validReport, reason })
      mockPrisma.moderationReport.count.mockResolvedValue(1)

      const res = await POST(makeRequest({ ...validReport, reason }))
      expect(res.status).toBe(201)
    }
  })
})
