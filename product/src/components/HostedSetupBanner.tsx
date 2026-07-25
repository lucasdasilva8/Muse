"use client";

import { useEffect, useState } from "react";
import { apiListListings } from "@/lib/api";

/** Shown on hosted deploys until Supabase env vars are configured. */
export function HostedSetupBanner() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void apiListListings()
      .then((data) => {
        if (data.needsSupabaseSetup) {
          setShow(true);
          setMessage(data.message);
        }
      })
      .catch(() => {
        /* ignore — local / offline */
      });
  }, []);

  if (!show) return null;

  return (
    <div className="callout" style={{ margin: "0 0 1rem", borderColor: "var(--accent, #2a9d8f)" }}>
      <strong>Experimental deploy — storage not wired yet.</strong>
      <p style={{ marginTop: "0.5rem" }}>{message}</p>
      <p className="muted" style={{ marginTop: "0.5rem" }}>
        Create a free Supabase project, run <code>product/supabase/schema.sql</code>, then add
        the three keys in Vercel → Project → Settings → Environment Variables. Redeploy.
      </p>
    </div>
  );
}
