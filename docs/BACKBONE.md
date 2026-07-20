# Investment & listing backbone

How the product app implements “put yourself on Muse” and “invest.”

## State machine

### Listing
`draft` → (publish) → `live` | `pending_review` → `funded` → `closed`

- **live**: open for investment  
- **pending_review**: pricing incoherent; saved but not fan-browsable as live (dashboard still sees it — currently filter is live/funded only on browse; pending shows on artist dashboard via currentArtistId)  
- **funded**: `raisedAmount >= R`

### Investment
On confirm: create `Investment` with `fanFraction = amount / R`, increment `listing.raisedAmount`.

## Artist publish pipeline

```
profile + traction + revenue + terms
        ↓
computePricing(Q, G, V_adj, R_suggested, risk, coherent)
        ↓
if coherent → status live
else → pending_review
        ↓
persist Listing in store
```

## Fan invest pipeline

```
select listing → enter amount/email
        ↓
validate remaining capacity & min $25
        ↓
fanFraction = amount / R
        ↓
persist Investment + update raisedAmount
```

## Swap-out path (production)

Replace `src/lib/store.ts` localStorage with API routes + Postgres. Keep `pricing.ts` and `types.ts` as the domain core.
