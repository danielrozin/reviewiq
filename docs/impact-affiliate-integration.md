# Impact.com Affiliate API integration (DAN-368)

This wires the **Impact.com** affiliate API into ReviewIQ. The account here is a
**media-partner / publisher** account (its Account SID starts with `IR`), i.e. we are the
affiliate that earns commissions, not the advertiser.

## What's in the repo

| File | Purpose |
| --- | --- |
| `lib/impact/client.ts` | API client. Basic-auth (`base64(AccountSID:AuthToken)`), media-partner namespace, `isImpactConfigured()`, `impactRequest()`, `verifyImpactCredentials()`. |
| `scripts/verify-impact-credentials.ts` | Read-only credential check. `npm run impact:verify`. |
| `.env.example` | `IMPACT_ACCOUNT_SID`, `IMPACT_AUTH_TOKEN` placeholders. |

The real credentials live **only** in `.env` (git-ignored) locally and in the Vercel
project environment for production. They are never committed.

## Configure

```bash
# .env (local) and Vercel → Project → Settings → Environment Variables
IMPACT_ACCOUNT_SID=IR...        # media-partner SID
IMPACT_AUTH_TOKEN=...           # auth token — secret
```

Verify:

```bash
npm run impact:verify
# [impact] ok=true status=200
# [impact] Authenticated. Partner is enrolled in N program(s).
```

## Status as of 2026-05-23 (DAN-368)

- ✅ Credentials supplied on the ticket **authenticate** (HTTP 200).
- ⚠️ The account is currently enrolled in **only one active program: InVideo**
  (CampaignId `12258`). ReviewIQ's published reviews are physical products (robot
  vacuums, espresso machines, etc.), so there is **no program coverage that matches the
  current catalog yet**. The API key is wired, but it cannot generate meaningful
  affiliate revenue until relevant programs are joined in the Impact.com dashboard.
- ⚠️ **Rotate the Auth Token.** It was pasted in plaintext into the DAN-368 ticket, so
  treat it as exposed. Rotate in Impact.com → Settings → API, then update `.env` and the
  Vercel env. Future secrets should go straight into the env store, never into tickets.

## Why there's no affiliate link rendering yet

ReviewIQ product data (`data/products.ts`) has **no outbound buy/affiliate URLs** today —
products carry `brand`, `priceRange`, and internal comparison links only. So this task
delivers the *foundation* (authenticated client + secret management). Turning it into
revenue is follow-on work:

1. Join Impact.com programs that match reviewed brands (or add an Amazon Associates path).
2. Add an affiliate-link field to the product model / data.
3. Use the Impact API (`/TrackingLinks`, `/Ads`) or deep-link tooling to produce tracked
   URLs, fronted by an internal redirect route (e.g. `/go/[productId]`) for click logging
   and `rel="sponsored nofollow"` compliance + FTC affiliate disclosure.

See DAN-371 (affiliate routing layer) for that build-out.
