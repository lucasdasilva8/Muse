# Muse product backbone

Next.js app that implements the core investment / listing pipeline locally.

## Run

```bash
cd product
npm install
npm run dev
```

Open http://localhost:3000

## Flows

### Artist — put yourself on Muse
`/artist/apply` → Profile → Traction → Revenue → Terms → Publish  
Uses `computePricing()` for Q, G, V_adj, R_suggested, risk, coherence.  
Coherent offers go `live`; incoherent ones go `pending_review`.

### Fan — invest
`/browse` → `/listing/[id]` → `/invest/[id]`  
Commits amount into raise (`raisedAmount`, `fanFraction = amount / R`).  
`/portfolio` looks up commitments by email.

### Artist dashboard
`/artist/dashboard` — raise progress, investors, pricing snapshot, sample payout preview.

## Architecture

| Piece | Path | Role |
|-------|------|------|
| Types | `src/lib/types.ts` | Artist, listing, investment domain |
| Pricing | `src/lib/pricing.ts` | Math + policy guardrails |
| Store | `src/lib/store.ts` | localStorage persistence (swap later for API/DB) |
| Seed | `src/lib/seed.ts` | Mira Vale sample listing |

Data key: `muse.store.v1` in the browser.

## Not included yet (next backbone layers)

- Auth (Clerk / Supabase)
- Postgres
- Stripe Connect / escrow
- Document upload
- Real email / notifications
- Securities compliance gates

## Marketing site

Static GitHub Pages site lives in the repo root. Link users to this app once deployed (Vercel) or run locally alongside Pages.
