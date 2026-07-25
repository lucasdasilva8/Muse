import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True on Vercel or when MUSE_HOSTED=true (experimental public deploy). */
export function isHostedDeploy(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.MUSE_HOSTED === "true" ||
    process.env.MUSE_HOSTED === "1"
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Server-side client — prefers service role for prototype writes */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getBackendMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}

/**
 * Hosted (Vercel) deploys cannot persist to the filesystem.
 * Public experimental use requires Supabase.
 */
export function hostedNeedsSupabase(): boolean {
  return isHostedDeploy() && !isSupabaseConfigured();
}
