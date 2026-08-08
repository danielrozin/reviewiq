# Impact.com Integration — Affiliate Routing Layer Scope

**Owner:** VP Product (DAN-371)
**Parent epic:** [DAN-368](/DAN/issues/DAN-368)
**Sibling / fallback:** [DAN-365](/DAN/issues/DAN-365) (Amazon Associates env-var path)
**Repos in scope:** AversusB (Next.js comparison site), ReviewIQ / SmartReview (product reviews)
**Target file location:** `docs/affiliate/impact-integration.md` in each repo (or shared via the SmartReview workspace if both projects share the routing package).
**Status:** Board accepted the "Impact = primary affiliate router" direction on [DAN-368](/DAN/issues/DAN-368) (2026-05-23). Open for CTO sign-off on the implementation specifics below. Implementation tasks will be filed as child issues of DAN-368 once this lands.

---

## 0. TL;DR

We will route all monetizable outbound clicks through a **server-side redirect endpoint** (`/go/[merchant]/[campaignId]?sub=...`) that signs the destination using the Impact.com Mediapartners API on each click, falls back to Amazon Associates for any merchant not present in the Impact program list, and emits a structured sub-ID per click (`{project}_{slug}_{position}`) so revenue is attributable to the specific comparison page and CTA position. FTC disclosure must render above the fold on any page that renders a tracked link.

---

## 1. Merchant Enrollment Plan

For each Tier-1 merchant we already promote (or want to promote), we apply to the merchant's program on Impact.com. Where a merchant runs more than one program (e.g., "consumer" vs "business"), we apply to the **consumer / direct** program unless noted.

> Commission percentages are **expected at enrollment** and informed by publicly observable rate cards / industry norms. Final rates are confirmed during program approval and **must be reconciled in the Impact Mediapartners dashboard** before the routing layer flips on for that merchant. Where we cannot confirm a rate, we ship the routing wired and treat the rate as `null` until confirmed.

### 1.0 Verified account state (2026-05-23, from DAN-368)

The provisioned Impact.com key was verified live (read-only `GET /Mediapartners/{SID}/Campaigns` → HTTP 200). Findings that anchor this plan:

- The account is a **media partner / publisher** account (SID prefix `IR`) — correct type for earning commissions.
- It is currently enrolled in **exactly one active program: InVideo** (`CampaignId 12258`). InVideo is an AI video SaaS — it maps to neither the AversusB Tier-1 categories nor the ReviewIQ catalog below, so **today the routing layer would have ~zero monetizable inventory**.
- Therefore the **enrollment plan in §1.1–§1.2 is a hard prerequisite to revenue**, not optional polish. Every program below currently shows as "not enrolled" and must be applied for (board action [DAN-272](/DAN/issues/DAN-272)).
- The auth client that performs this check already exists in this repo — `lib/impact/client.ts` (`verifyImpactCredentials()`, `isImpactConfigured()`, `impactRequest()`), runnable via `npm run impact:verify`. Implementation child issues should build on it rather than re-implement auth (see §4.2).

### 1.1 AversusB — Tier-1 comparison categories

#### VPN
| Merchant   | Impact Program (search term)       | Expected commission       | Notes |
|------------|-------------------------------------|---------------------------|-------|
| NordVPN    | "Nord Security" / "NordVPN"        | 30–40% new sale           | Highest payout for new subs (≥1 yr plan); reduced rate on renewals. |
| ExpressVPN | "ExpressVPN"                       | $13–$36 CPS               | Flat-fee CPS, not %; tier depends on plan length. |
| Surfshark  | "Surfshark"                        | 40% new sale              | Long cookie window (~30 days). |

#### SaaS / Productivity
| Merchant      | Impact Program           | Expected commission     | Notes |
|---------------|--------------------------|-------------------------|-------|
| Notion        | "Notion Labs"            | 50% recurring (12 mo)   | High-value if conversion is paid plan; free signups don't pay. |
| ClickUp       | "ClickUp"                | $0–$100+ CPA tiered     | Tier depends on plan signed up to (Free → no payout). |
| Monday.com    | "monday.com"             | ~$80–$100 CPA + revshare| Strong B2B program; check region eligibility (some restrictions). |
| Asana         | "Asana" (if available on Impact) | Lower / variable | If not on Impact, route to fallback (see §6). Asana historically uses different network. |

#### Mattress
| Merchant | Impact Program | Expected commission | Notes |
|----------|----------------|---------------------|-------|
| Saatva   | "Saatva"       | 8–12% per sale      | High AOV ($1.5k–$3k) — top earner for the category. |
| Helix    | "Helix Sleep"  | 5–10% per sale      | Per-mattress payout; bundles often higher. |
| Nectar   | "Nectar Sleep" | 5–10% per sale      | Bonus tiers during seasonal campaigns. |

#### Coffee
| Merchant   | Impact Program | Expected commission | Notes |
|------------|----------------|---------------------|-------|
| Breville   | "Breville"     | 3–5% per sale       | Appliance margins are thin; expect lower %. May need fallback if program isn't on Impact in our region. |
| Nespresso  | "Nespresso"    | 5–8% on machines    | Machine purchases pay; pod re-purchases typically excluded. |

### 1.2 ReviewIQ / SmartReview — top product programs

ReviewIQ surfaces individual product reviews. Initial enrollment is the same merchant set above (because the site reviews the same brands), plus a second wave once the first 10 programs are approved:

- **Wave 1 (apply day 1):** all 12 merchants above.
- **Wave 2 (apply once Wave 1 approves):** any merchant that appears in the top 50 product slugs for the project that is **not** on Amazon. Maintain the candidate list in `docs/affiliate/impact-merchants.csv` (created in implementation).

### 1.3 Approval timeline risk

Several merchants (NordVPN, ExpressVPN, Saatva) commonly take **5–15 business days** to approve a new media partner. The routing layer must therefore ship with **placeholder programs marked `pending` in the merchant config** so we can flip individual merchants live as approvals land — without redeploying.

---

## 2. Page Placement Spec

### 2.1 Components that render an Impact tracking link

Across both projects, the same three component surfaces render outbound links today:

| Component                        | Where it appears                                | Today's behavior (DAN-365)                          | New behavior under Impact routing |
|----------------------------------|-------------------------------------------------|-----------------------------------------------------|------------------------------------|
| `AffiliateButton`                | Inline on comparison rows + product cards       | Renders Amazon link with `?tag=$NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | Renders `/go/{merchant}/{campaignId}?sub=…` (see §3 + §4) |
| `StickyAffiliateCTA`             | Bottom-of-viewport CTA after scroll threshold   | Sticky Amazon CTA with primary entity name          | Calls the same router with `position=sticky` sub-ID segment |
| Comparison-page CTAs (`<table>` row CTAs and the verdict-section "Check Price" buttons) | Embedded in `ComparisonPage` template | Per-entity Amazon links | Per-entity router call; fallback to Amazon if merchant not enrolled |

The component API does **not** change for callers. Internally, each component calls a single helper (`buildAffiliateHref(entity, position)`) that encapsulates the routing decision (see §6). Callers continue to pass the entity (the product/brand being linked to) and a `position` string.

### 2.2 Click-through behavior (required on all three surfaces)

- `target="_blank"` (open in new tab — keep our page in the user's history).
- `rel="sponsored noopener"` — `sponsored` is the FTC- and Google-recommended attribute for paid links; `noopener` prevents `window.opener` access. Add `noreferrer` only if we explicitly want to suppress the referrer, which we do **not** — we want the merchant to see the referrer for attribution and program QA.
- `data-affiliate-merchant`, `data-affiliate-campaign`, `data-affiliate-position` attributes for analytics + Playwright tests.
- The existing `trackEvent("affiliate_click", { merchant, campaignId, position, sub })` call moves into `buildAffiliateHref`'s `onClick`-equivalent (server redirect endpoint also logs server-side; client event remains for client-side funnels and the `cta-button-style` A/B experiment from DAN-365).

### 2.3 Pages that must NOT render a tracked link

- Editorial / explainer / glossary pages (no buyer intent → no commercial link).
- Admin / dashboard / preview routes.
- Any page rendered with the `?preview=1` query (we don't want previews in our analytics).

---

## 3. Sub-ID Schema

### 3.1 Format

```
{project}_{slug}_{position}
```

- `{project}` — short, lowercase, `[a-z0-9]+`. Reserved values: `aversusb`, `reviewiq` (and `smartreview` as alias if the repo name differs in code — pick one and stick with it; the helper normalizes).
- `{slug}` — the page slug, lowercased, hyphenated, **truncated to 60 chars** to stay under Impact's sub-ID 70-char limit after the project + position prefixes.
- `{position}` — one of: `primary`, `sticky`, `table-row`, `card`, `verdict`, `inline`. Free-form is **forbidden** (validated at the helper); new values must be added to the enum.

Examples:
- `aversusb_nord-vpn-vs-express-vpn_primary`
- `aversusb_saatva-vs-helix_table-row`
- `reviewiq_breville-barista-express_sticky`

### 3.2 Constraints + reasoning

- Impact.com sub-IDs allow `[A-Za-z0-9_-]` and roughly 70 chars per sub-ID slot. We use `_` as the **outer** separator and `-` inside slugs, so the pattern is unambiguous to parse back.
- Five sub-ID slots are exposed by Impact (`subId1`–`subId5`). We use **`subId1` only** for the composite string above so all reporting can pivot on a single column. Keeping `subId2`–`subId5` reserved for future experiments (e.g., A/B variant id) prevents schema churn.
- The composite is built and validated by `buildSubId({project, slug, position})` in the affiliate package. Reject any slug containing `_` to prevent ambiguity.

### 3.3 Reporting hooks

Once revenue starts flowing, the Impact Actions API (`/Actions`) returns `SubId1` per conversion. A nightly job (out of scope here, file as a child issue) joins `SubId1` against our page table to attribute revenue per slug.

---

## 4. API Integration Approach

**Decision: Option (b) — runtime redirect endpoint.** This matches the CTO recommendation and gives us:

1. A single point of click logging (server-side, immune to ad blockers that drop client-side events).
2. The ability to A/B different campaigns / creatives without redeploying the site (the destination URL is decided at click time).
3. Centralized fallback decisioning (Impact vs Amazon vs nothing) — see §6.
4. Clean separation between the **rendered** href (always our internal `/go/...`) and the **destination**, so we can change networks (Impact ↔ Amazon ↔ direct) without touching component code.

### 4.1 Endpoint contract

```
GET /go/[merchant]/[campaignId]?sub={subId1}&pos={position}&page={slug}
```

- Implemented as a Next.js Route Handler in each project: `app/go/[merchant]/[campaignId]/route.ts`.
- Performs:
  1. Merchant lookup in the in-memory merchant config (loaded from `affiliate/merchants.json` at build time, see §4.4).
  2. If `merchant.network === "impact"` and `merchant.status === "active"`: builds the Impact tracking link via `https://api.impact.com/Mediapartners/{SID}/Programs/{ProgramId}/TrackingLinks` (or uses the cached deeplink template — see §4.3).
  3. Else falls through to the Amazon path (§6): `https://www.amazon.com/dp/{asin}?tag={NEXT_PUBLIC_AMAZON_AFFILIATE_TAG}&{subId-as-ascsubtag}`.
  4. Logs `{merchant, campaignId, subId, page, position, network, ts, ip-hash, ua-hash}` to our analytics sink (`trackEvent("affiliate_redirect", …)` server-side).
  5. Issues a **HTTP 302** with `Cache-Control: no-store` and `Referrer-Policy: no-referrer-when-downgrade`.
- **No cookies** are set by our redirect — Impact's pixel sets its own.

### 4.2 Auth pattern (consuming Impact API)

```ts
const auth = "Basic " + Buffer
  .from(`${process.env.IMPACT_ACCOUNT_SID}:${process.env.IMPACT_AUTH_TOKEN}`)
  .toString("base64");
// fetch(`https://api.impact.com/Mediapartners/${SID}/...`, { headers: { Authorization: auth } })
```

Both env vars are set by the CEO in Vercel; the codebase only reads them via `process.env`. Never log either var. The `IMPACT_ACCOUNT_SID` is also used in the URL path — that's expected per Impact's API contract (the SID is not the secret; the auth token is).

> **Already implemented (DAN-368):** this exact auth pattern, plus `impactRequest()`, `isImpactConfigured()`, and `verifyImpactCredentials()`, ships in `lib/impact/client.ts` in the ReviewIQ/SmartReview repo. The redirect endpoint and merchant sync should import from there (and AversusB should port or share the same module per Open Question §8.2). Rotation/Vercel setup is tracked in [DAN-754](/DAN/issues/DAN-754).

### 4.3 Tracking link generation: live vs cached

Calling the Impact API on **every** redirect is wasteful (and slow, and rate-limited). We hybrid:

1. **At build time** (or via a daily cron — out of scope, child issue), fetch the tracking-link **template** for each `{merchant, campaignId}` pair via the Impact API and cache the template URL in `affiliate/merchants.json` keyed by `{merchant}/{campaignId}`.
2. **At click time**, the redirect endpoint substitutes `{subId1}` and any other macros into the cached template — pure string operations, ~1ms, no outbound API call.
3. If the template lookup misses (cold cache, new merchant) we hit the API live, cache the result in memory for the lifetime of the lambda, and serve the redirect.

This keeps the click path on the order of 10–30ms (single redirect hop) and removes the Impact API as a hard dependency for click handling.

### 4.4 Merchant config (`affiliate/merchants.json`)

Single source of truth, committed to the repo, edited by humans (or by the daily cron), shape:

```jsonc
{
  "nordvpn": {
    "network": "impact",
    "programId": "12345",
    "status": "active",            // "active" | "pending" | "paused"
    "defaultCampaignId": "primary",
    "campaigns": {
      "primary":  { "trackingTemplate": "https://nordvpn.com/.../?{subId1}" },
      "blackfri": { "trackingTemplate": "https://nordvpn.com/.../bf/?{subId1}" }
    },
    "expectedCommission": "30-40%",
    "approvedAt": "2026-05-02"
  },
  "asana": {
    "network": "fallback-amazon",
    "amazonAsin": null,            // no Amazon equivalent → button hidden
    "status": "pending"
  }
}
```

Status values:
- `active` — render and route via Impact.
- `pending` — render the button using the **fallback** path; do NOT route to Impact (program not yet approved).
- `paused` — hide the button entirely (compliance hold, performance issue, etc.).

---

## 5. Disclosure Compliance

### 5.1 Where the disclosure copy lives today

Both projects use Next.js with a shared `<DisclosureBanner />` component (verify exact path with the Fullstack devs during implementation; current best guess is `components/legal/DisclosureBanner.tsx`). The legal copy is sourced from `content/legal/affiliate-disclosure.mdx` (or equivalent CMS field).

If a centralized `<DisclosureBanner />` does not exist in one of the repos, the implementation child issue must add one before any Impact link is rendered. **No Impact-tracked link may render on a page that does not have the banner above the fold.** This is enforced by:

1. The `ComparisonPage` and `ProductReviewPage` page templates always render `<DisclosureBanner />` near the top of the content (not the global footer — must be visible without scrolling on mobile).
2. A unit test asserts the banner is present in any page snapshot that contains an `AffiliateButton` or `StickyAffiliateCTA`.
3. A pre-render guard in `buildAffiliateHref` calls `assertDisclosurePresentOnPage()` (a no-op in production, an `invariant` in dev/test) so a missing banner trips loud during local development.

### 5.2 Required copy

Plain-language, non-collapsible, in the **first viewport on mobile and desktop**. Recommended wording (review with legal counsel — file as child issue):

> _Some links on this page are affiliate links. If you click and make a purchase, we may earn a commission at no extra cost to you. Our editorial recommendations are not influenced by these partnerships._

The banner must:
- Be readable (not a tooltip; not behind a "Learn more" link by itself).
- Render before any `AffiliateButton` or `StickyAffiliateCTA` becomes interactive.
- Not be dismissable in a way that hides it on subsequent visits (a "got it" close button is acceptable per FTC if the disclosure remains visible in the page footer).

### 5.3 Per-link `rel="sponsored"`

Adding `rel="sponsored"` to every tracked link (§2.2) is **mandatory** — it is Google's machine-readable equivalent of the on-page disclosure and is required for clean SEO posture. Already covered in the component spec.

---

## 6. Reconciliation with DAN-365 (Amazon fallback)

The page templates call **one** function:

```ts
buildAffiliateHref({
  merchant: "nordvpn" | "saatva" | …,
  position: "primary" | "sticky" | "table-row" | "card" | "verdict" | "inline",
  page: { project: "aversusb", slug: "nord-vpn-vs-express-vpn" },
  amazonAsin?: string                       // optional — required for amazon fallback to render
}): { href: string; renderable: boolean; network: "impact" | "amazon" | "none" }
```

Decision tree inside `buildAffiliateHref`:

1. Look up `merchant` in `affiliate/merchants.json`.
2. If `network === "impact"` and `status === "active"` →
   `href = /go/${merchant}/${campaignId}?sub=${subId}&pos=${position}&page=${slug}` (Impact path).
3. Else if `amazonAsin` is provided **and** `process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true"` **and** `process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` is set →
   `href = https://www.amazon.com/dp/${amazonAsin}?tag=${TAG}&ascsubtag=${subId}` (Amazon fallback per DAN-365).
4. Else →
   `{ renderable: false, network: "none" }` and the component renders **nothing** (no broken-link CTA).

This keeps the merchant-routing fallback to a **single function call from page templates**. Components inspect `renderable` and either render the CTA or render an empty placeholder.

### 6.1 Mapping merchants to Amazon ASINs

Maintained in `affiliate/amazon-asins.json` (or co-located in `affiliate/merchants.json` under each merchant key as `amazonAsin`). Where no Amazon equivalent exists (e.g., NordVPN — VPNs aren't sold on Amazon meaningfully), `amazonAsin` is `null` and the button hides until Impact approval lands.

### 6.2 Migration order (so we never have a regression in revenue)

1. Land the routing layer (`buildAffiliateHref` + `/go/...` redirect) **without** changing any component callers — components keep doing what they do today (Amazon link via `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`). The router just routes Amazon → Amazon for now. _(Zero behavior change in prod.)_
2. Switch components to call `buildAffiliateHref`. Run the existing A/B (`cta-button-style` from DAN-365) to confirm CTR parity. _(Still Amazon under the hood for everything.)_
3. As each Impact merchant is approved, flip its `status` to `active` in `merchants.json` and ship a tiny PR. The router immediately starts sending those clicks to Impact instead of Amazon.
4. Track per-merchant revenue for 7 days post-flip. If Impact RPM is materially worse than Amazon for that merchant, flip it back to `fallback-amazon` until we diagnose.

---

## 7. Implementation Plan (proposed child issues of DAN-368)

| # | Title | Owner role | Notes |
|---|-------|------------|-------|
| 1 | Add `affiliate/merchants.json` + `buildAffiliateHref` helper to AversusB | Fullstack (aversusb) | Pure refactor; no behavior change. |
| 2 | Add `/go/[merchant]/[campaignId]/route.ts` redirect endpoint to AversusB | Fullstack (aversusb) | Server-side logging via existing analytics. |
| 3 | Repeat (1) + (2) for ReviewIQ / SmartReview | Fullstack (smartreview) | Should reuse the same package — extract `affiliate-router` into a shared package if/when both repos live in a monorepo. |
| 4 | Wire components (`AffiliateButton`, `StickyAffiliateCTA`, comparison CTAs) to `buildAffiliateHref` | Fullstack (per repo) | Required regression tests: snapshot for `rel="sponsored noopener"`, `target="_blank"`, presence of `<DisclosureBanner />`. |
| 5 | Daily Impact merchant + tracking-link sync cron | Backend / Fullstack | Refreshes `merchants.json` campaign templates from Impact API. |
| 6 | Apply to all Wave-1 Impact programs (CEO action) | CEO | Provides program IDs back to engineering; marks each merchant `active` in `merchants.json` as approval lands. |
| 7 | Revenue attribution job: Impact `/Actions` → page-level revenue table | Backend / Data | Joins `SubId1` against page slugs nightly. |
| 8 | Confirm `<DisclosureBanner />` placement above the fold on every templated page; add unit test | Fullstack | Compliance gate — must complete before Impact links go live. |
| 9 | Legal review of disclosure copy | CEO + (optional) external counsel | Lightweight, but required. |

Total engineering effort estimate: **6–9 dev-days across both repos**, parallelizable as 2 engineers × 3–5 days, plus CEO program-application work in parallel.

---

## 8. Open Questions for CEO + CTO

1. **Repo location for this doc** — single source in `aversusb`, single source in `smartreview`, or both? (Recommend: both, with a one-line "see canonical" pointer in the secondary repo.)
2. **Shared package?** — Should `affiliate-router` be lifted into a shared package now, or kept duplicated until a monorepo lands? (Recommend: duplicated for now; consolidation is a separate epic.)
3. **Program approvals** — Who applies to each Impact merchant program? (Assumed: CEO does Wave 1 in parallel with engineering work.)
4. **Asana, Breville, Nespresso on Impact** — confirm program availability in our region. If unavailable, those merchants stay on the Amazon fallback.
5. **A/B framework reuse** — Reuse `cta-button-style` to compare Impact-vs-Amazon for overlapping merchants in step 6.2(3)?

---

## 9. Acceptance Criteria for this scope doc

- All 6 questions in the issue have a concrete answer ✅
- API-integration decision is committed (option b) ✅
- Sub-ID schema is unambiguous and validated ✅
- Single-call fallback to Amazon is specified ✅
- Disclosure compliance gate is specified and testable ✅
- Implementation steps are ordered to avoid revenue regression ✅
