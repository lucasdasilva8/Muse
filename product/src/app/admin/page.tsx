"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RiskBadge, VerificationBadge } from "@/components/ListingBits";
import { apiAdminAction, apiAdminPending } from "@/lib/api";
import { money, pct } from "@/lib/format";
import { readClientSession } from "@/lib/clientSession";
import type { Listing } from "@/lib/types";

export default function AdminPage() {
  const [pending, setPending] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const session = typeof window !== "undefined" ? readClientSession() : null;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiAdminPending();
      setPending(data.pending);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function act(id: string, action: "approve" | "reject") {
    setNotice("");
    try {
      const data = await apiAdminAction(
        id,
        action,
        action === "reject" ? "Prototype rejection" : undefined
      );
      setPending(data.pending);
      setNotice(data.notice || `Listing ${action}d (prototype).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  }

  return (
    <AppShell active="/admin">
      <p className="eyebrow">Admin · prototype</p>
      <h1>Review queue</h1>
      <p className="lead">
        Listings that failed pricing coherence land here as{" "}
        <code>pending_review</code>. Approve to make them browsable — still a
        simulation.
      </p>

      {session?.role !== "admin" && (
        <div className="callout">
          Tip: set role to <strong>admin</strong> on{" "}
          <Link href="/session">/session</Link> for the demo path. This page is
          open in the prototype (no real access control).
        </div>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : pending.length === 0 ? (
        <div className="card">
          <p>No pending listings.</p>
          <p className="muted">
            Publish an incoherent offer (e.g. huge raise vs tiny revenue) from{" "}
            <Link href="/artist/apply">artist apply</Link> to see one here.
          </p>
        </div>
      ) : (
        pending.map((l) => (
          <div className="card" key={l.id} style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginBottom: "0.35rem" }}>{l.profile.stageName}</h2>
            <p className="meta">
              <VerificationBadge level={l.revenue.verification} />
              <RiskBadge risk={l.pricing.risk} />
              {money(l.terms.R)} · {pct(l.terms.S)} · {l.terms.T} mo
            </p>
            <ul className="muted" style={{ paddingLeft: "1.1rem", margin: "0.75rem 0" }}>
              {l.pricing.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <div className="btn-row">
              <button className="btn" type="button" onClick={() => act(l.id, "approve")}>
                Approve → live
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => act(l.id, "reject")}
              >
                Reject
              </button>
              <Link className="btn btn-outline" href={`/listing/${l.id}`}>
                Open
              </Link>
            </div>
          </div>
        ))
      )}

      {notice && <p className="callout-ok callout">{notice}</p>}
    </AppShell>
  );
}
