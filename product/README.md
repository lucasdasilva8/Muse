# Muse product backbone (PROTOTYPE)

Next.js app that simulates listing + investing. **Not fully functioning** — no
payments, auth, escrow, or legal offering.

## Run

```bash
cd product
npm install
npm run dev
```

Open http://localhost:3000 (or the port Next prints).

## What works (simulated)

| Flow | UI | API |
|------|----|-----|
| Browse listings | `/browse` | `GET /api/listings` |
| View offer | `/listing/[id]` | `GET /api/listings/[id]` |
| Publish artist offer | `/artist/apply` | `POST /api/listings/publish` |
| Simulate invest | `/invest/[id]` | `POST /api/invest` |
| Portfolio lookup | `/portfolio` | `GET /api/me?email=` |
| Artist dashboard | `/artist/dashboard` | `GET /api/me?artistId=` |
| Reset demo data | Browse button | `DELETE /api/listings` |

Persistence: local file `product/.data/muse.json` (gitignored).

## What does NOT work yet

- Real user accounts / login  
- Stripe or any card charges  
- Escrow / bank payouts  
- Document verification uploads  
- Supabase (schema file is ready, client not wired)  
- Securities compliance  

Every API response includes `"prototype": true`.

## Future Supabase

Schema draft: `supabase/schema.sql`  
Copy `.env.example` → `.env.local` when you add keys later. The app still runs without them.

## Architecture

```
UI pages → src/lib/api.ts → /api/* routes → src/lib/server/db.ts
                                              ↳ domain.ts (pricing + rules)
                                              ↳ .data/muse.json
```
