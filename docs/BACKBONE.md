# Investment & listing backbone (PROTOTYPE)

**Status:** Prototype — not fully functioning. Simulated data only.

## How it runs today

```
Browser UI
   ↓ fetch
Next.js API routes (/api/listings, /api/invest, /api/me)
   ↓
server/db.ts  →  .data/muse.json
   ↓
domain.ts (publish + invest rules) + pricing.ts
```

Every JSON response includes:

```json
{
  "prototype": true,
  "payments": false,
  "auth": false,
  "escrow": false,
  "legalOffering": false
}
```

## State machine (simulated)

### Listing
`draft` → publish → `live` | `pending_review` → `funded`

### Investment
`POST /api/invest` creates a row with `status: "committed"` but **no payment** is taken.

## Artist publish

`POST /api/listings/publish` → `computePricing` → save listing in JSON store.

## Fan invest

`POST /api/invest` → validate remaining raise → `fanFraction = amount / R` → save.

## Future (not implemented)

1. Run `supabase/schema.sql` in a Supabase project  
2. Replace `server/db.ts` JSON reads/writes with Supabase client  
3. Add auth, then Stripe Connect / escrow  
4. Keep `domain.ts` + `pricing.ts` as the product core  

Until then, treat the app as a **demo of the flow**, not a live marketplace.
