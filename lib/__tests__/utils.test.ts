import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  averageRatingFromDistribution,
  productAverageRating,
} from '../utils'

describe('formatNumber', () => {
  it('returns plain number for values under 1000', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(1)).toBe('1')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K')
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(999999)).toBe('1000.0K')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M')
    expect(formatNumber(2500000)).toBe('2.5M')
    expect(formatNumber(10000000)).toBe('10.0M')
  })
})

describe('getScoreColor', () => {
  it('returns green for scores >= 80', () => {
    expect(getScoreColor(80)).toBe('text-trust-green')
    expect(getScoreColor(100)).toBe('text-trust-green')
  })

  it('returns yellow for scores 60-79', () => {
    expect(getScoreColor(60)).toBe('text-yellow-500')
    expect(getScoreColor(79)).toBe('text-yellow-500')
  })

  it('returns red for scores < 60', () => {
    expect(getScoreColor(59)).toBe('text-trust-red')
    expect(getScoreColor(0)).toBe('text-trust-red')
  })
})

describe('getScoreBgColor', () => {
  it('returns green bg for scores >= 80', () => {
    expect(getScoreBgColor(80)).toBe('bg-trust-green')
    expect(getScoreBgColor(95)).toBe('bg-trust-green')
  })

  it('returns yellow bg for scores 60-79', () => {
    expect(getScoreBgColor(60)).toBe('bg-yellow-500')
    expect(getScoreBgColor(75)).toBe('bg-yellow-500')
  })

  it('returns red bg for scores < 60', () => {
    expect(getScoreBgColor(50)).toBe('bg-trust-red')
    expect(getScoreBgColor(0)).toBe('bg-trust-red')
  })
})

describe('getScoreLabel', () => {
  it('returns Excellent for scores >= 90', () => {
    expect(getScoreLabel(90)).toBe('Excellent')
    expect(getScoreLabel(100)).toBe('Excellent')
  })

  it('returns Great for scores 80-89', () => {
    expect(getScoreLabel(80)).toBe('Great')
    expect(getScoreLabel(89)).toBe('Great')
  })

  it('returns Good for scores 70-79', () => {
    expect(getScoreLabel(70)).toBe('Good')
    expect(getScoreLabel(79)).toBe('Good')
  })

  it('returns Fair for scores 60-69', () => {
    expect(getScoreLabel(60)).toBe('Fair')
    expect(getScoreLabel(69)).toBe('Fair')
  })

  it('returns Mixed for scores 50-59', () => {
    expect(getScoreLabel(50)).toBe('Mixed')
    expect(getScoreLabel(59)).toBe('Mixed')
  })

  it('returns Poor for scores < 50', () => {
    expect(getScoreLabel(49)).toBe('Poor')
    expect(getScoreLabel(0)).toBe('Poor')
  })
})

describe('averageRatingFromDistribution', () => {
  it('computes the weighted average over the full population', () => {
    // 342 reviews: (5*185 + 4*98 + 3*32 + 2*18 + 1*9) / 342 = 1458 / 342 = 4.263...
    const avg = averageRatingFromDistribution({ 5: 185, 4: 98, 3: 32, 2: 18, 1: 9 }, 342)
    expect(avg).toBeCloseTo(4.263, 2)
  })

  it('returns 0 for a missing distribution or non-positive total', () => {
    expect(averageRatingFromDistribution(undefined, 342)).toBe(0)
    expect(averageRatingFromDistribution({ 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 }, 0)).toBe(0)
  })
})

describe('productAverageRating', () => {
  it('prefers the distribution average over the small review sample', () => {
    // Sample reviews average 5.0, but the full distribution averages ~4.26 —
    // the distribution (tied to reviewCount) must win.
    const product = {
      reviewCount: 342,
      ratingDistribution: { 5: 185, 4: 98, 3: 32, 2: 18, 1: 9 },
      reviews: [{ rating: 5 }, { rating: 5 }],
    } as any
    expect(productAverageRating(product)).toBeCloseTo(4.263, 2)
  })

  it('falls back to the sample-review average when no distribution data exists', () => {
    const product = {
      reviewCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [{ rating: 5 }, { rating: 4 }],
    } as any
    expect(productAverageRating(product)).toBe(4.5)
  })

  it('returns 0 when there is neither distribution data nor reviews', () => {
    const product = {
      reviewCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
    } as any
    expect(productAverageRating(product)).toBe(0)
  })
})
