# Muse product backbone (EXPERIMENTAL PROTOTYPE)

Next.js app simulating the Muse product loop. **Not a live securities product.**

## Run locally

```bash
cd product
npm install
npm run dev
```

## Deploy experimentally (web)

See [../docs/DEPLOY_EXPERIMENTAL.md](../docs/DEPLOY_EXPERIMENTAL.md) — Vercel root directory `product` + Supabase required for shared persistence.

## Features (simulated)

- Artist apply / publish, fan invest, portfolio
- Admin review queue
- Revenue → payout simulation
- Simulated fiat escrow (collect → hold → release)
- Document upload stubs (`/api/documents`)
- Optional Supabase — see [../docs/SUPABASE_SETUP.md](../docs/SUPABASE_SETUP.md)

Without Supabase env vars → local `.data/muse.json` + `.data/uploads/` (local only).

## API additions

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/escrow` | Escrow ledger + close/release (sim) |
| GET/POST/PATCH | `/api/documents` | List / upload / verify flag |
| GET | `/api/documents/[id]` | Download file |

Backend mode is returned on every response as `mode: "local-json-file" | "supabase"`.
