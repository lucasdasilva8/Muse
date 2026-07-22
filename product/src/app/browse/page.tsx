"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  RaiseProgress,
  RiskBadge,
  VerificationBadge,
} from "@/components/ListingBits";
import { money, pct } from "@/lib/format";
import { useHasMounted, useLiveListings } from "@/lib/hooks";
import { apiResetPrototype } from "@/lib/api";

export default function BrowsePage() {
  const mounted = useHasMounted();
  const { listings, loading, error, refresh } = useLiveListings();

  return (
    <AppShell active="/browse" home>
      <header className="hero hero-compact">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="container">
          <p className="eyebrow" style={{ color: "#7dbeb2" }}>
            Fan · browse · prototype
          </p>
          <h1>Live offers</h1>
          <p className="hero-lead">
            Simulated listings from the prototype API. Commitments are fake —
            nothing is sold or charged.
          </p>
        </div>
      </header>

      <div className="app-main">
        {!mounted || loading ? (
          <p className="muted">Loading prototype store…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : listings.length === 0 ? (
          <div className="card">
            <p>No live listings yet.</p>
            <div className="btn-row">
              <Link className="btn" href="/artist/apply">
                Create a prototype listing
              </Link>
            </div>
          </div>
        ) : (
          listings.map((l) => (
            <div className="listing-row" key={l.id}>
              <div>
                <h3>{l.profile.stageName}</h3>
                <p className="meta">
                  {l.profile.genre} · {l.profile.location} ·{" "}
                  <VerificationBadge level={l.revenue.verification} />
                  <RiskBadge risk={l.pricing.risk} />
                  <span className="badge badge-mid">Prototype</span>
                </p>
                <p className="meta" style={{ marginTop: "0.35rem" }}>
                  {money(l.terms.R)} raise · {pct(l.terms.S)} share · {l.terms.T}{" "}
                  mo · {l.terms.C}× cap ·{" "}
                  {l.traction.monthlyListeners.toLocaleString()} listeners
                </p>
                <RaiseProgress listing={l} />
              </div>
              <Link className="btn btn-ink" href={`/listing/${l.id}`}>
                View offer
              </Link>
            </div>
          ))
        )}

        {mounted && (
          <p className="muted" style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                await apiResetPrototype();
                await refresh();
              }}
            >
              Reset prototype data
            </button>
          </p>
        )}
      </div>
    </AppShell>
  );
}
