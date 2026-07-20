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
import { resetStore } from "@/lib/store";

export default function BrowsePage() {
  const mounted = useHasMounted();
  const listings = useLiveListings();

  return (
    <AppShell active="/browse">
      <p className="eyebrow">Fan · browse</p>
      <h1>Live offers</h1>
      <p className="lead">
        Listings published through the artist flow (plus the Mira Vale sample)
        show up here.
      </p>

      {!mounted ? (
        <p className="muted">Loading local store…</p>
      ) : listings.length === 0 ? (
        <div className="card">
          <p>No live listings yet.</p>
          <div className="btn-row">
            <Link className="btn" href="/artist/apply">
              Create one
            </Link>
            <button className="btn btn-outline" type="button" onClick={() => resetStore()}>
              Reset sample data
            </button>
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
              </p>
              <p className="meta" style={{ marginTop: "0.35rem" }}>
                {money(l.terms.R)} raise · {pct(l.terms.S)} share · {l.terms.T}{" "}
                mo · {l.terms.C}× cap · {l.traction.monthlyListeners.toLocaleString()}{" "}
                listeners
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
            onClick={() => {
              resetStore();
              window.location.reload();
            }}
          >
            Reset to sample data
          </button>
        </p>
      )}
    </AppShell>
  );
}
