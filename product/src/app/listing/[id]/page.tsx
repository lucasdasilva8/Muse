"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DocumentPanel } from "@/components/DocumentPanel";
import { EscrowPanel } from "@/components/EscrowPanel";
import {
  PricingPanel,
  RaiseProgress,
  RiskBadge,
  VerificationBadge,
} from "@/components/ListingBits";
import { readClientSession } from "@/lib/clientSession";
import { money, pct } from "@/lib/format";
import { useHasMounted, useListingDetail } from "@/lib/hooks";

export default function ListingPage() {
  const params = useParams();
  const id = String(params.id || "");
  const mounted = useHasMounted();
  const { listing, investments, loading, error, refresh } = useListingDetail(id);
  const [canVerify, setCanVerify] = useState(false);
  const [canActEscrow, setCanActEscrow] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const role = readClientSession().role;
    setCanVerify(role === "admin");
    setCanActEscrow(role === "admin" || role === "artist");
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <AppShell>
        <p className="muted">Loading prototype listing…</p>
      </AppShell>
    );
  }

  if (error || !listing) {
    return (
      <AppShell>
        <h1>Listing not found</h1>
        <p className="error">{error}</p>
        <Link className="btn" href="/browse">
          Back to browse
        </Link>
      </AppShell>
    );
  }

  const t = listing.terms;

  return (
    <AppShell active="/browse">
      <p className="eyebrow">Listing · prototype</p>
      <h1>{listing.profile.stageName}</h1>
      <p className="meta">
        {listing.profile.genre} · {listing.profile.location} ·{" "}
        <VerificationBadge level={listing.revenue.verification} />
        <RiskBadge risk={listing.pricing.risk} />
        <span className="badge badge-mid">Not a real offer</span>
      </p>

      <div className="callout">
        Prototype page loaded from <code>/api/listings/{listing.id}</code>.
        Commitments are held in simulated fiat escrow — not a live payment.
      </div>

      <div className="grid-2" style={{ marginTop: "1.5rem" }}>
        <div>
          <p className="lead">{listing.profile.bio || "No bio yet."}</p>
          <p className="muted">Purpose: {listing.profile.raisePurpose}</p>
          <p className="muted">Links: {listing.profile.links || "—"}</p>

          <div className="grid-3" style={{ marginTop: "1.25rem" }}>
            <div className="stat">
              <div className="label">Monthly listeners</div>
              <div className="value">
                {listing.traction.monthlyListeners.toLocaleString()}
              </div>
            </div>
            <div className="stat">
              <div className="label">6-mo growth</div>
              <div className="value">{pct(listing.traction.growthRate6mo)}</div>
            </div>
            <div className="stat">
              <div className="label">TTM defined net</div>
              <div className="value">{money(listing.revenue.vann)}</div>
            </div>
          </div>

          <PricingPanel listing={listing} />

          <DocumentPanel listingId={listing.id} canVerify={canVerify} />

          <h2 style={{ marginTop: "1.5rem" }}>
            Simulated investors ({investments.length})
          </h2>
          <table className="table">
            <thead>
              <tr>
                <th>Fan</th>
                <th>Amount</th>
                <th>Pool %</th>
                <th>Custody</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((i) => (
                <tr key={i.id}>
                  <td>{i.fanName}</td>
                  <td>{money(i.amount)}</td>
                  <td>{pct(i.fanFraction, 2)}</td>
                  <td>
                    <span className="badge badge-mid">{i.custody}</span>
                  </td>
                </tr>
              ))}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={4}>No commitments yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          <EscrowPanel
            listing={listing}
            canAct={canActEscrow}
            onUpdated={refresh}
          />
        </div>

        <aside className="card">
          <h2>Offer terms</h2>
          <table className="table">
            <tbody>
              <tr>
                <th>Raise (R)</th>
                <td>{money(t.R)}</td>
              </tr>
              <tr>
                <th>Share (S)</th>
                <td>{pct(t.S)} of defined net</td>
              </tr>
              <tr>
                <th>Term (T)</th>
                <td>{t.T} months</td>
              </tr>
              <tr>
                <th>Cap (C)</th>
                <td>
                  {t.C}× · max pool {money(t.R * t.C)}
                </td>
              </tr>
              <tr>
                <th>Categories</th>
                <td>{listing.revenue.categories.join(", ")}</td>
              </tr>
            </tbody>
          </table>
          <RaiseProgress listing={listing} />
          <div className="btn-row">
            <Link
              className="btn"
              href={`/invest/${listing.id}`}
              style={{ width: "100%" }}
            >
              Simulate invest
            </Link>
            <Link
              className="btn btn-outline"
              href="/browse"
              style={{ width: "100%" }}
            >
              All listings
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
