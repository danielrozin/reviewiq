/**
 * DAN-2230 / DAN-1852 leak guard.
 *
 * categoryHubSchema emits a CollectionPage that claims "this page IS the
 * collection". Rendered from anywhere other than the /category/[slug] index
 * route, it would tell crawlers a product detail page is the whole category hub
 * — the exact bug shipped once and fixed in PR #57. A unit test on the schema
 * function can't see this: the leak is a matter of WHICH route renders it, so
 * assert route scoping at the source level.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const CATEGORY_DIR = join(process.cwd(), 'app/category')
const INDEX_ROUTE = join(CATEGORY_DIR, '[slug]/page.tsx')

// Route files only: __tests__ mentions categoryHubSchema by name and is not a route.
function collectRouteFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : collectRouteFiles(full)
    }
    return /\.tsx?$/.test(entry.name) ? [full] : []
  })
}

describe('categoryHubSchema route scoping', () => {
  it('is rendered by the /category/[slug] index route', () => {
    // Positive control: without this, the exclusion test below passes vacuously
    // (e.g. after a rename that leaves nothing to find anywhere).
    expect(readFileSync(INDEX_ROUTE, 'utf8')).toContain('categoryHubSchema')
  })

  it('is not rendered by any other route under /category', () => {
    const leaks = collectRouteFiles(CATEGORY_DIR)
      .filter((file) => file !== INDEX_ROUTE)
      .filter((file) => readFileSync(file, 'utf8').includes('categoryHubSchema'))
    expect(leaks).toEqual([])
  })

  it('has no shared segment layout that could emit hub schema onto detail pages', () => {
    // A layout.tsx at [slug] wraps /category/[slug]/[product] too, which is how
    // PR #57's leak happened. If one is ever added, this test forces a decision.
    expect(existsSync(join(CATEGORY_DIR, '[slug]/layout.tsx'))).toBe(false)
    expect(existsSync(join(CATEGORY_DIR, 'layout.tsx'))).toBe(false)
  })
})
