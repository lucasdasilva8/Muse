# Experimental public deploy (product app)

Goal: let people try the Muse **product prototype** on the web soon — still simulated (no payments / securities).

Recommended stack: **Vercel** (Next.js) + **Supabase** (shared DB). Local `.data/muse.json` does **not** work for multi-user hosted use.

## 1. Supabase (required for hosted)

1. Create a free project at [supabase.com](https://supabase.com)
2. SQL editor → run all of [`product/supabase/schema.sql`](../product/supabase/schema.sql)
3. Storage → New bucket → name **`muse-docs`** (private is fine)
4. Project Settings → API → copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (server only — never commit)

## 2. Deploy on Vercel

1. Push this repo to GitHub (already: `lucasdasilva8/Muse`)
2. [vercel.com/new](https://vercel.com/new) → Import the Muse repo
3. **Root Directory:** set to `product` (important)
4. Framework: Next.js (auto)
5. Environment Variables (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `MUSE_PROTOTYPE` | `true` |
| `MUSE_HOSTED` | `true` |

6. Deploy → copy the URL (e.g. `https://muse-xxxx.vercel.app`)

Without Supabase env vars, the site still builds but shows a setup banner and blocks writes (serverless has no durable local disk).

## 3. Point the marketing site at the app

In [`assets/js/main.js`](../assets/js/main.js), set:

```js
const PRODUCT_APP_URL = "https://YOUR-DEPLOY.vercel.app";
```

CTAs marked `data-product-app` will open that URL. Until set, they fall back to the static GitHub Pages prototype pages.

## 4. Smoke-test checklist

- [ ] `/browse` loads Mira Vale (or empty until seed — use Session → Reset if you add a reset control)
- [ ] Publish artist → listing appears
- [ ] Simulate invest → custody `in_escrow`
- [ ] Artist dashboard → close raise / release escrow
- [ ] Banner still says experimental / no payments

## 5. What this is not

- Not KYC, not Stripe, not a live offering
- Session roles are browser-only (prototype)
- Service role key unlocks full DB writes — rotate if leaked; tighten RLS before any real users with real money

## Local still works

```bash
cd product && npm install && npm run dev
```

No Supabase needed locally — uses `.data/muse.json`.
