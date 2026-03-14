# SmartReview

AI-powered product review platform. Honest, structured, verified buyer intelligence.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Intelligence**: DataForSEO API
- **SEO**: JSON-LD structured data, XML sitemaps, semantic HTML

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
/app                    # Next.js App Router pages
/components             # React components
  /layout               # Header, Footer
  /product              # Product-specific components
  /ui                   # Shared UI components
/data                   # Seed data (categories, products)
/lib                    # Utilities and integrations
  /dataforseo           # DataForSEO API client
  /schema               # JSON-LD structured data
  /seo                  # SEO metadata utilities
/types                  # TypeScript type definitions
```

## Environment Variables

```
DATAFORSEO_LOGIN=       # DataForSEO API login
DATAFORSEO_PASSWORD=    # DataForSEO API password
NEXT_PUBLIC_SITE_URL=   # Site URL for SEO
NEXT_PUBLIC_SITE_NAME=  # Site name
```

## MVP Categories

- Robot Vacuums
- Coffee Machines
- Air Fryers
- Wireless Earbuds
- Mattresses
