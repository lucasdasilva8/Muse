# Muse product backbone (PROTOTYPE — in development)

Next.js app simulating the Muse product loop. **Not fully functioning.**

## Run

```bash
cd product
npm install
npm run dev
```

## Features (simulated)

- Artist apply / publish, fan invest, portfolio
- Admin review queue
- Revenue → payout simulation
- **Document upload stubs** (`/api/documents`)
- **Optional Supabase** — see [../docs/SUPABASE_SETUP.md](../docs/SUPABASE_SETUP.md)

Without Supabase env vars → local `.data/muse.json` + `.data/uploads/`.

## API additions

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST/PATCH | `/api/documents` | List / upload / verify flag |
| GET | `/api/documents/[id]` | Download file |

Backend mode is returned on every response as `mode: "local-json-file" | "supabase"`.
