# Muse — Product Plan

**Version:** 0.1  
**Status:** Planning (no fake metrics, no live invest flow yet)  
**Reference site:** [lucasdasilva8.github.io/Muse](https://lucasdasilva8.github.io/Muse/#about)

This doc covers: how Muse works for artists and for the team, the pricing math, sitemap + wireframes, tech stack, and phased implementation.

---

## 1. What Muse Is

Muse is a **revenue-share marketplace**. Artists list a defined slice of future music earnings. Fans buy into that slice at a price set by structured terms + verified inputs. Muse handles verification, pricing structure, escrow, and payouts.

**Not:** donation / tip jar / equity in a company (v1).  
**Is:** a contract where fans fund an artist now and receive a % of defined future revenue for a set period (often with a return cap).

**Legal note (blocker before real money):** fan investment in future earnings can be treated as a security. Get a securities lawyer before enabling checkout. Until then, ship marketing + waitlist + manual pilot deals.

---

## 2. Roles

| Role | Job |
|------|-----|
| **Artist** | Apply, verify metrics + revenue, set offer terms, raise capital, report revenue, pay fans |
| **Fan / Investor** | Discover artists, read terms, invest, receive payouts, track portfolio |
| **Muse (ops)** | Verify docs, approve listings, run pricing review, hold escrow, process payouts, handle disputes |

---

## 3. Artist Process (end to end)

```
Apply → Identity check → Connect traction → Upload financials
  → Muse review → Set offer terms → Pricing suggestion
  → Artist accepts → Listing live → Raise closes
  → Funds released (minus Muse fee) → Ongoing revenue reporting → Payouts to fans
```

### Step A — Apply
Artist creates an account and submits:
- Legal name / stage name
- Genre, location, links (Spotify, Instagram, etc.)
- Why they are raising and how funds will be used (studio, tour, marketing, etc.)

### Step B — Identity
Muse verifies the person controlling the listing (ID check via Stripe Identity or equivalent).

### Step C — Traction inputs
Artist connects or pastes public/verified metrics Muse will use in pricing:
- Monthly listeners (Spotify or equivalent)
- Recent growth trend (e.g. last 3–6 months)
- Release cadence / catalog size
- Optional: engagement rate, playlist adds (later)

**v1:** artist enters numbers + screenshots / API connection if available.  
**Muse:** spot-checks against public pages before approval.

### Step D — Revenue disclosure
Artist declares **defined income** categories they will share, for example:
- Streaming royalties
- Sync / licensing
- Merch (optional)
- Live / ticket (optional; harder to verify — often exclude in v1)

Artist uploads supporting docs (distributor statements, tax docs, bank/export PDFs).  
Muse marks revenue as:
- **Unverified** — self-reported only (listing may be rejected or labeled high risk)
- **Document-backed** — statements match disclosure
- **Linked** — later: Plaid / distributor API (future)

### Step E — Set offer terms (artist controls these)
Artist chooses:

| Input | Meaning |
|-------|---------|
| `R` | Raise target ($) — how much capital they want |
| `S` | Revenue share % — portion of *defined net* sold to the fan pool |
| `T` | Term length (months) |
| `C` | Return cap (e.g. 1.5× total invested) — optional but recommended |
| Categories | Which income streams are included |

Fans collectively own share `S` of defined net for up to `T` months, or until the pool has received `C × R`, whichever comes first (if cap is used).

### Step F — Pricing suggestion (Muse math)
Muse runs the pricing model (Section 5) and shows:
- Suggested share price / number of shares
- Implied “stream valuation” range
- Verification / risk label
- Whether the raise looks coherent vs disclosed revenue

Artist can adjust `R`, `S`, `T`, `C` within Muse guardrails. Extreme offers (e.g. huge raise vs tiny revenue) are blocked or require manual approval.

### Step G — Listing goes live
After Muse approval, public artist page shows:
- Music / story
- Traction summary
- Revenue band (verified level disclosed, not raw tax returns)
- Exact terms (`R`, `S`, `T`, `C`)
- Risk disclosure
- Invest CTA (or “Request access” until legal ready)

### Step H — Raise closes
When `R` is reached (or campaign end date):
1. Funds sit in escrow briefly
2. Muse takes platform fee on the raise
3. Net proceeds go to artist
4. Each fan’s ownership of the pool is locked: `fan_weight = fan_amount / R`

### Step I — Ongoing reporting + payouts
On a schedule (monthly or quarterly):
1. Artist reports defined net for the period (or Muse pulls linked statements)
2. Muse reviews / auto-checks
3. Amount due to fan pool = `S × defined_net`
4. Each fan receives `fan_weight × pool_amount` (minus payout fee)
5. Track cumulative paid vs cap `C × R`; stop when hit or when `T` ends

---

## 4. Muse Internal Process (ops)

```
Intake queue → Verify identity → Verify traction → Verify financials
  → Run pricing → Approve / request changes → Publish listing
  → Monitor raise → Close & disburse → Review each payout cycle
  → Disputes / clawbacks if needed
```

### Ops checklist per listing
1. Identity match
2. Traction numbers match public sources (within tolerance)
3. Docs support disclosed revenue band
4. Offer terms within policy (min/max `S`, `T`, `R`, required cap for new artists)
5. Risk label assigned
6. Disclosures present on page
7. Artist bank / payout method ready (Stripe Connect)

### Muse fees (proposed)
- **Raise fee:** % of `R` at close (e.g. 5–8%)
- **Payout fee:** % of each distribution to fans (e.g. 2–5%)

Keep fees visible on every listing.

### What Muse does *not* do in v1
- Guarantee returns
- Trade shares on a secondary market
- Take ownership of the artist’s IP
- Promise “stock-like” upside

---

## 5. Pricing Math (simple, no sample numbers)

### 5.1 Definitions

| Symbol | Definition |
|--------|------------|
| `R` | Raise amount ($) |
| `S` | Fan pool’s share of defined net (0–1, e.g. 0.15 = 15%) |
| `T` | Term in months |
| `C` | Cap multiple on invested capital (e.g. 1.5). Omit if uncapped |
| `N` | Number of shares in the listing |
| `P` | Price per share |
| `V_ann` | Estimated annual defined net (from disclosure + docs) |
| `G` | Traction / growth factor (dimensionless score from metrics) |
| `Q` | Revenue quality factor (verification depth) |

Constraint:

```
R = N × P
```

Artist picks `R` (and optionally `N`); Muse sets or suggests `P` so the offer is coherent.

### 5.2 What fans are buying

Fans buy a claim on:

```
pool_claim = S × (future defined net over the term)
```

With optional stop:

```
total_paid_to_pool ≤ C × R
```

So the **maximum** the whole fan pool can receive is `C × R` if a cap is set.

An individual fan who invested `a` receives:

```
fan_fraction = a / R
fan_payout_period = fan_fraction × (S × defined_net_period)
```

### 5.3 Implied stream value (for transparency)

If fans buy share `S` of the revenue stream by paying `R`, the **implied value of 100% of that defined stream** (under these terms) is:

```
V_implied = R / S
```

Example shape only (no real data): if someone pays for 10% of a stream with a $10k raise, implied full-stream value is $100k.  
Use this on the listing as “what this raise implies,” not as a promise.

### 5.4 Suggested raise range (Muse algorithm)

Muse suggests a coherent `R` from revenue + traction + terms:

**Step 1 — Annualized revenue estimate**

```
V_ann = disclosed_trailing_or_run_rate_defined_net
```

Prefer document-backed figures. If only self-reported, lower `Q`.

**Step 2 — Quality + growth adjustments**

```
V_adj = V_ann × Q × G
```

Where:
- `Q` ∈ (0, 1] — higher when docs/API verify revenue  
- `G` — based on listener level + growth + release activity (bounded, e.g. 0.7–1.3 so it cannot invent revenue)

**Step 3 — Expected pool cash over the term (uncapped, illustrative)**

```
E_pool ≈ S × V_adj × (T / 12)
```

**Step 4 — Cap-aware expected pool cash**

```
E_pool_capped = min(E_pool, C × R)   // R unknown yet if suggesting R; see below
```

When *suggesting* `R`, solve for a raise that is not larger than what the stream can plausibly support:

```
R_suggested = (S × V_adj × (T / 12)) / C
```

Interpretation: under a cap of `C×`, size the raise so a “base case” run-rate could approach the cap over the term — not so the artist can raise unlimited capital against tiny revenue.

Also apply hard guardrails:

```
R_min ≤ R ≤ R_max(V_adj, S, T, policy)
```

### 5.5 Share price

Two equivalent listing styles (pick one for product consistency):

**Style A — Fixed share count**

```
N = chosen round number (e.g. artist or Muse sets N)
P = R / N
```

**Style B — Percent of the pool**  
Fans buy % of the fan pool directly (`a / R`); no need for share tokens. Simpler for v1.

**Recommendation for v1:** Style B (dollar amount → pool %). Add share tokens later if secondary market becomes legal/useful.

### 5.6 Traction score `G` (inputs only — weights TBD with real data)

Inputs (normalize each to a 0–1 scale later with real distributions):
1. Monthly listeners (level)
2. Listener growth rate
3. Catalog / release activity
4. Optional engagement

```
G = clamp( g(listeners, growth, releases), G_min, G_max )
```

Do **not** invent weights until you have pilot artists. For pilots, Muse ops can set `G` manually inside the clamp.

### 5.7 Revenue quality `Q`

| Level | Meaning | Example `Q` |
|-------|---------|-------------|
| Self-reported | Numbers only | 0.5–0.7 |
| Document-backed | Statements match | 0.85–0.95 |
| Linked / recurring | API or bank feed | 1.0 |

Listings below a minimum `Q` should not go public.

### 5.8 Risk label

Assign from verification + offer aggressiveness:

- **Higher risk:** low `Q`, short track record, high `R` vs `V_adj`, no cap  
- **Medium:** docs OK, moderate raise  
- **Lower (still speculative):** strong docs + conservative `R`/`S`/`C`

Always show: *Music revenue is uncertain; you can lose money.*

### 5.9 Worked structure (symbols only)

Artist sets `S`, `T`, `C`. Muse estimates `V_adj`. Then:

```
R_suggested = (S × V_adj × T/12) / C
P = R / N          // if using shares
fan_fraction = a / R
period_payout_to_fan = fan_fraction × S × defined_net_period
stop when sum(payouts) ≥ C × R  or  months ≥ T
```

---

## 6. Fan Process

```
Browse / search → Artist page → Read terms + risk → Invest amount
  → Confirm → Portfolio → Receive payouts → (optional) follow artist updates
```

Fan must see before paying:
1. Exact `S`, `T`, `C`, included income categories  
2. Verification level  
3. Risk disclosure  
4. Fees  
5. That there is **no secondary market in v1** (money is locked for the term)

---

## 7. Sitemap

### Public marketing
```
/                     Home
/how-it-works         How Muse works (artist + fan + payouts)
/for-artists          Artist value prop + apply CTA
/for-fans             Fan value prop + waitlist / browse CTA
/trust                Verification, docs, escrow, fees
/legal/terms
/legal/risk
/legal/privacy
/about                Origin (Brown), mission — evolve from current #about
```

### Marketplace (after pilots)
```
/browse               Artist listings
/artists/[slug]       Artist + live offer
```

### Auth + app
```
/login
/signup
/apply                Artist application

/app/artist           Artist dashboard
/app/artist/offer     Create / edit offer
/app/artist/docs      Upload financials
/app/artist/payouts   Revenue report + history

/app/fan              Fan portfolio
/app/fan/invest/[id]  Invest flow
/app/fan/payouts      Payout history

/app/admin            Ops queue (internal)
```

### v0 (now)
Keep a simple site (evolve current GitHub Pages):
```
/           Home (no fake stats)
/how        How it works + math in plain language
/artists    Apply waitlist
/fans       Investor waitlist
/about      Story
```

**Change from current site:** remove placeholder stats (500+ artists, $2M+, etc.). Replace with waitlist + process clarity + Brown pilot framing.

---

## 8. Wireframes (text)

### 8.1 Home
```
┌─────────────────────────────────────────────┐
│  Muse          How it works  About  [Apply] │
├─────────────────────────────────────────────┤
│  MUSE                                       │
│  Invest in artists. Earn when they do.      │
│  [Browse / Join waitlist]  [List your music]│
│  ─────────────────────────────────────────  │
│  Full-bleed atmosphere (real artist photo)  │
├─────────────────────────────────────────────┤
│  The gap                                    │
│  Artists need capital. Fans already spend.  │
│  Muse turns support into a revenue share.   │
├─────────────────────────────────────────────┤
│  How a share works                          │
│  Artist sets % + term → Muse verifies →     │
│  Fans fund raise → Payouts when revenue hits│
├─────────────────────────────────────────────┤
│  Trust                                      │
│  Traction checks · Document-backed revenue  │
│  Clear terms · Escrow · Visible fees        │
├─────────────────────────────────────────────┤
│  Born at Brown · Early pilot coming         │
│  [Artist apply]  [Fan waitlist]             │
└─────────────────────────────────────────────┘
```

### 8.2 Artist offer builder
```
┌─────────────────────────────────────────────┐
│  Create offer                               │
│  Raise R:     [________]                    │
│  Share S:     [____] % of defined net       │
│  Term T:      [____] months                 │
│  Cap C:       [____] ×                      │
│  Categories:  [x] streaming [ ] merch ...   │
│                                             │
│  Muse suggestion                            │
│  R_suggested: …   Q: …   G: …   Risk: …     │
│  Implied V = R / S                          │
│  [Request approval]                         │
└─────────────────────────────────────────────┘
```

### 8.3 Artist listing (fan view)
```
┌─────────────────────────────────────────────┐
│  Artist name · genre · location             │
│  Traction summary (listeners, growth)       │
│  Verification: Document-backed              │
│                                             │
│  Offer                                      │
│  Raising R · Selling S% · Term T · Cap C    │
│  Included: streaming, …                     │
│  Fees: …                                    │
│  Risk: …                                    │
│  [Invest] / [Join waitlist]                 │
│                                             │
│  Updates / music links                      │
└─────────────────────────────────────────────┘
```

### 8.4 Muse admin queue
```
┌─────────────────────────────────────────────┐
│  Pending listings                           │
│  Artist | Q | G | R | S | T | Status        │
│  ...    |   |   |   |   |   | Review docs   │
│  [Approve] [Request changes] [Reject]       │
└─────────────────────────────────────────────┘
```

---

## 9. Recommended Tech Stack

### Phase 0–1 (landing + waitlists + manual pilots)
| Layer | Choice | Why |
|-------|--------|-----|
| Site | **Next.js** (App Router) on **Vercel** | Fast to ship, good SEO, easy upgrade to full app |
| Forms / waitlist | **Resend** + DB, or **Tally/Typeform** short-term | Collect artist/fan interest without building auth yet |
| Docs / CRM | Notion or Airtable | Ops queue before admin UI |
| Payments (manual pilots) | **Stripe** invoices / Payment Links | No full marketplace yet |
| Contracts | Lawyer-drafted PDF + e-sign (DocuSign/Dropbox Sign) | Required for real pilots |

### Phase 2 (real product)
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js + TypeScript | Same codebase as marketing |
| Auth | **Clerk** or **Supabase Auth** | Fast, solid |
| Database | **Postgres** via **Supabase** or **Neon** | Listings, investments, payouts |
| File storage | Supabase Storage or S3 | Financial docs (private) |
| Payments | **Stripe Connect** | Artist payouts + platform fees |
| Identity | Stripe Identity | Artist KYC |
| Email | Resend | Transactional |
| Metrics | Manual + public APIs first; Chartmetric / Spotify later | Don’t block on API partnerships |
| Hosting | Vercel + managed Postgres | Simple ops for a small team |

### Avoid early
- Custom broker trading engine  
- Crypto / tokens (adds regulatory surface)  
- Mobile apps (responsive web first)  
- Secondary market

---

## 10. Implementation Plan

### Now — Docs + positioning
- [x] Process + math doc (this file)
- [ ] Legal consult scheduled (securities / Reg CF vs private contracts)
- [ ] Standard offer template (one-pager terms)
- [ ] Pricing spreadsheet v0 (inputs: V_ann, Q, G, S, T, C → R_suggested)

### Phase 0 — Credible site (replace fake stats)
- [ ] Rebuild landing from current GitHub Pages into Next.js (or clean static)
- [ ] Sections: Home, How it works, For artists, For fans, Trust, About
- [ ] Dual waitlists (artist / fan)
- [ ] No fabricated metrics

### Phase 1 — Concierge pilots (Brown / local)
- [ ] 3–5 artists, manual verification + spreadsheet pricing
- [ ] Signed revenue-share agreements
- [ ] Stripe collection + tracked payouts in a spreadsheet/Airtable
- [ ] Learn: what terms feel fair, what docs artists actually have

### Phase 2 — MVP product
- [ ] Auth + artist apply + doc upload
- [ ] Admin approval queue
- [ ] Public listings
- [ ] Fan invest flow (only after legal green light)
- [ ] Portfolio + payout ledger

### Phase 3 — Automation
- [ ] Pricing engine in product (not just spreadsheet)
- [ ] Recurring payout workflows
- [ ] Stronger metric integrations
- [ ] Scale beyond campus

### Phase 4 — Later (only if needed / legal)
- [ ] Secondary transfers
- [ ] Manager/label accounts
- [ ] Mobile polish

---

## 11. Website Direction vs Current Example

Keep from the current site:
- Clear dual CTA (investor / musician)
- Simple “how it works” rhythm
- Brown origin story

Change greatly:
- Drop fake social proof numbers until true
- Replace vague “earn returns” with **revenue share terms**
- Add Trust / verification as a first-class page
- Shift visual system away from generic purple-glow startup (current CSS uses purple/pink on dark) toward a more distinct studio/editorial look when rebuilding
- Lead with **Muse** as brand + one precise sentence

---

## 12. Open Decisions

1. **Legal wrapper:** Reg CF, Reg D, or private revenue-share contracts for pilots?  
2. **v1 income categories:** streaming-only vs streaming + merch?  
3. **Share style:** pool % (recommended) vs priced share tokens?  
4. **Cap required?** Recommended yes for early artists.  
5. **Pilot geography:** Brown-only first?

---

## 13. Next Build Actions

1. Pricing spreadsheet v0 (formulas from Section 5)  
2. Redesign landing IA per Section 7–8  
3. Artist + fan waitlist forms  
4. One-page legal/offer outline for lawyer review  

---

*Internal planning doc. Not legal advice. Not an offering.*
