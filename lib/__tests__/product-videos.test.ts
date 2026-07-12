/**
 * Integrity of the product video catalogue.
 *
 * The seeded youtubeVideos[] data was never checked against YouTube: 205 of 266 IDs did
 * not exist, 14 pointed at a review of a different product (a Sony page carried a Jabra
 * review; another carried a John Lennon music video), and the titles were written by
 * hand. All of it was published as VideoObject JSON-LD and rendered as embeds.
 *
 * scripts/verify-youtube-videos.mts is the only thing that should ever write this data.
 * These tests are the offline tripwire for anything added by hand afterwards — they need
 * no network, so they run in CI.
 */
import { describe, it, expect } from 'vitest'
import { getAllProducts } from '@/data/products'

const entries = getAllProducts().flatMap((p) =>
  (p.youtubeVideos ?? []).map((v) => ({ ...v, product: p.slug }))
)

describe('product video catalogue', () => {
  it('has videos to check', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  // The verifier is the only writer that knows the channel, because it reads it back
  // from YouTube. A hand-added video cannot supply one honestly, so a missing channel
  // means the entry never passed verification.
  it('carries the publishing channel for every video, proving it came from YouTube', () => {
    const unverified = entries.filter((v) => !v.channel)
    expect(
      unverified.map((v) => `${v.product}: ${v.id}`),
      'run `npm run verify:videos -- --write` instead of adding videos by hand'
    ).toEqual([])
  })

  // A video has exactly one real title. The old data listed the same ID under up to
  // three products with a different invented title on each — which is why a Jabra review
  // could appear as "Sony WF-1000XM5 In-Depth Review". A genuine "A vs B" video may
  // legitimately sit on both products' pages, but it must read identically on both.
  it('never gives one video two different titles', () => {
    const byId = new Map<string, Set<string>>()
    for (const v of entries) {
      byId.set(v.id, (byId.get(v.id) ?? new Set()).add(v.title))
    }
    const conflicting = [...byId.entries()]
      .filter(([, titles]) => titles.size > 1)
      .map(([id, titles]) => `${id}: ${[...titles].join(' | ')}`)
    expect(conflicting).toEqual([])
  })

  // uploadDate is what the build-date bug corrupted: it is only ever a real, past
  // publication date read off YouTube.
  it('only carries real, past upload dates', () => {
    const today = new Date().toISOString().slice(0, 10)
    const bad = entries
      .filter((v) => v.uploadDate)
      .filter((v) => !/^\d{4}-\d{2}-\d{2}$/.test(v.uploadDate!) || v.uploadDate! > today)
      .map((v) => `${v.product}: ${v.id} -> ${v.uploadDate}`)
    expect(bad).toEqual([])
  })
})
