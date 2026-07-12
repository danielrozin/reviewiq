/**
 * The /products hub advertises all 100 product money pages in its ItemList
 * JSON-LD, but the grid that used to render them lived entirely inside a
 * useSearchParams client component. Next prerenders that subtree as its Suspense
 * fallback, so the HTML crawlers actually received was a skeleton: zero links to
 * any product, while the structured data claimed all of them.
 *
 * This asserts the invariant that broke: every URL the hub schema promises has a
 * real <a href> in the server-rendered markup.
 */
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductsPage from '../page'
import { productsHubSchema } from '@/lib/schema/jsonld'
import { products } from '@/data/products'

// Stands in for the client-only search component, exactly as the prerender does.
vi.mock('@/components/product/ProductSearch', () => ({
  ProductSearch: () => null,
}))

describe('/products hub is crawlable without JavaScript', () => {
  const html = renderToStaticMarkup(<ProductsPage />)

  it('renders a link to every product page the ItemList schema promises', () => {
    const promised = productsHubSchema(products).mainEntity.itemListElement.map(
      (item: { url: string }) => new URL(item.url).pathname
    )

    const missing = promised.filter((path) => !html.includes(`href="${path}"`))

    expect(promised).toHaveLength(products.length)
    expect(missing).toEqual([])
  })

  it('renders the hub heading and product names as text, not a loading skeleton', () => {
    expect(html).toContain('<h1')
    expect(html).toContain('All products')
    expect(html).toContain(products[0].name)
  })
})
