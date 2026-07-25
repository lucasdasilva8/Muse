# Supabase setup (optional)

The product app runs on **local JSON** by default. **Hosted / experimental web deploys require Supabase** (see [DEPLOY_EXPERIMENTAL.md](DEPLOY_EXPERIMENTAL.md)).

To use Supabase locally or on Vercel:

1. Create a project at [supabase.com](https://supabase.com)
2. SQL editor → paste and run `product/supabase/schema.sql`
3. Storage → New bucket → name **`muse-docs`** (private)
4. Project Settings → API → copy URL + `anon` + `service_role` keys
5. In `product/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

6. Restart `npm run dev`

API responses will show `"mode": "supabase"`. Without these env vars, mode stays `"local-json-file"`.

Still a **prototype** — not production auth/RLS/payments.
