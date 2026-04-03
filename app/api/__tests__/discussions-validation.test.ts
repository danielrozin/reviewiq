/**
 * Tests for /api/discussions/thread route — thread creation and listing.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPrisma = vi.hoisted(() => ({
  discussionThread: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST, GET } from '../discussions/thread/route'

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest(new URL('/api/discussions/thread', 'http://localhost:3000'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeGetRequest(query = ''): NextRequest {
  return new NextRequest(new URL(`/api/discussions/thread${query}`, 'http://localhost:3000'))
}

const validThread = {
  title: 'Which headphones are better?',
  body: 'I am looking for recommendations on headphones for music production.',
  threadType: 'question',
  authorId: 'u1',
}

describe('POST /api/discussions/thread', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects title shorter than 5 chars', async () => {
    const res = await POST(makePostRequest({ ...validThread, title: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('rejects body shorter than 10 chars', async () => {
    const res = await POST(makePostRequest({ ...validThread, body: 'Short' }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid threadType', async () => {
    const res = await POST(makePostRequest({ ...validThread, threadType: 'invalid' }))
    expect(res.status).toBe(400)
  })

  it('rejects missing authorId', async () => {
    const { authorId, ...rest } = validThread
    const res = await POST(makePostRequest(rest))
    expect(res.status).toBe(400)
  })

  it('creates thread successfully with valid data', async () => {
    mockPrisma.discussionThread.create.mockResolvedValue({
      id: 't1',
      ...validThread,
      tags: [],
      author: { id: 'u1', name: 'Test', image: null, trustLevel: 'basic' },
      product: null,
    })

    const res = await POST(makePostRequest(validThread))
    expect(res.status).toBe(201)
  })

  it('accepts all valid thread types', async () => {
    const types = [
      'question', 'discussion', 'issue', 'recommendation',
      'comparison', 'long_term_update', 'warning', 'positive_surprise', 'tip',
    ]
    for (const threadType of types) {
      mockPrisma.discussionThread.create.mockResolvedValue({
        id: 't1', ...validThread, threadType, tags: [],
        author: { id: 'u1', name: 'Test', image: null, trustLevel: 'basic' },
        product: null,
      })
      const res = await POST(makePostRequest({ ...validThread, threadType }))
      expect(res.status).toBe(201)
    }
  })
})

describe('GET /api/discussions/thread', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns paginated threads with defaults', async () => {
    mockPrisma.discussionThread.findMany.mockResolvedValue([])
    mockPrisma.discussionThread.count.mockResolvedValue(0)

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('threads')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('limit')
  })

  it('filters by productId', async () => {
    mockPrisma.discussionThread.findMany.mockResolvedValue([])
    mockPrisma.discussionThread.count.mockResolvedValue(0)

    await GET(makeGetRequest('?productId=p1'))

    expect(mockPrisma.discussionThread.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productId: 'p1' }),
      })
    )
  })

  it('caps limit at 50', async () => {
    mockPrisma.discussionThread.findMany.mockResolvedValue([])
    mockPrisma.discussionThread.count.mockResolvedValue(0)

    await GET(makeGetRequest('?limit=100'))

    expect(mockPrisma.discussionThread.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    )
  })

  it('orders by pinned first then createdAt desc', async () => {
    mockPrisma.discussionThread.findMany.mockResolvedValue([])
    mockPrisma.discussionThread.count.mockResolvedValue(0)

    await GET(makeGetRequest())

    expect(mockPrisma.discussionThread.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      })
    )
  })

  it('only shows active threads', async () => {
    mockPrisma.discussionThread.findMany.mockResolvedValue([])
    mockPrisma.discussionThread.count.mockResolvedValue(0)

    await GET(makeGetRequest())

    expect(mockPrisma.discussionThread.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'active' }),
      })
    )
  })
})
