# Muse product backbone (PROTOTYPE — in development)

Next.js app simulating the Muse product loop. **Not fully functioning** — no
payments, real auth, escrow, or legal offering.

## Run

```bash
cd product
npm install
npm run dev
```

Open the URL Next prints (often http://localhost:3000 or :3001).

## Product loop (simulated)

1. **Session** `/session` — pick fan / artist / admin (browser-only identity)
2. **Artist apply** `/artist/apply` — publish offer via API
3. **Admin** `/admin` — approve `pending_review` listings
4. **Fan browse + invest** `/browse` → `/invest/[id]`
5. **Dashboard** `/artist/dashboard` — report revenue → simulate payout split
6. **Portfolio** `/portfolio` — look up commitments by email

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET/DELETE | `/api/listings` | Live list / reset demo |
| GET | `/api/listings/[id]` | Listing + investors |
| POST | `/api/listings/publish` | Create offer |
| POST | `/api/invest` | Simulate commitment |
| GET/POST | `/api/admin` | Pending queue / approve-reject |
| GET/POST | `/api/payouts` | List / simulate revenue period |
| GET/POST | `/api/session` | Prototype server session bind |
| GET | `/api/me` | Portfolio / artist dashboard data |

Persistence: `product/.data/muse.json` (gitignored).

Every response includes `"prototype": true`.
