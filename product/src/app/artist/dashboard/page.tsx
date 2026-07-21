"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  PricingPanel,
  RaiseProgress,
  RiskBadge,
  VerificationBadge,
} from "@/components/ListingBits";
import { money, pct } from "@/lib/format";
import { useArtistDashboard, useHasMounted } from "@/lib/hooks";
import { fanPeriodPayout } from "@/lib/pricing";

export default function ArtistDashboardPage() {
  const mounted = useHasMounted();
  const { listings, investments, currentArtistId, loading, error } =
    useArtistDashboard();

  const listing = listings[0];

  if (!mounted || loading) {
    return (
      <AppShell active="/artist/dashboard">
        <p className="muted">Loading prototype dashboard…</p>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell active="/artist/dashboard">
        <p className="error">{error}</p>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell active="/artist/dashboard">
        <h1>No artist listing yet</h1>
        <p className="lead">Publish a prototype offer to see your dashboard.</p>
        <Link className="btn" href="/artist/apply">
          List yourself
        </Link>
      </AppShell>
    );
  }

  const samplePool = listing.terms.S * 2400;

  return (
    <AppShell active="/artist/dashboard">
      <p className="eyebrow">Artist dashboard · prototype</p>
      <h1>{listing.profile.stageName}</h1>
      <p className="meta">
        <VerificationBadge level={listing.revenue.verification} />
        <RiskBadge risk={listing.pricing.risk} />
        <span className="badge badge-mid">{listing.status}</span>
        <span className="badge badge-warn">Simulated</span>
      </p>

      <div className="callout">
        Loaded from prototype API. No payouts are sent.{" "}
        {currentArtistId
          ? `Bound to artist ${currentArtistId}.`
          : "Showing sample Mira Vale until you publish."}
      </div>

      <div className="grid-3" style={{ margin: "1.25rem 0" }}>
        <div className="card stat">
          <div className="label">Raised (sim)</div>
          <div className="value">{money(listing.raisedAmount)}</div>
          <RaiseProgress listing={listing} />
        </div>
        <div className="card stat">
          <div className="label">Fans in</div>
          <div className="value">{investments.length}</div>
        </div>
        <div className="card stat">
          <div className="label">TTM defined net</div>
          <div className="value">{money(listing.revenue.vann)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <h2>Your offer</h2>
          <table className="table">
            <tbody>
              <tr>
                <th>R</th>
                <td>{money(listing.terms.R)}</td>
              </tr>
              <tr>
                <th>S</th>
                <td>{pct(listing.terms.S)}</td>
              </tr>
              <tr>
                <th>T / C</th>
                <td>
                  {listing.terms.T} mo · {listing.terms.C}×
                </td>
              </tr>
              <tr>
                <th>Categories</th>
                <td>{listing.revenue.categories.join(", ")}</td>
              </tr>
            </tbody>
          </table>

          <h2>Simulated investors</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Fan</th>
                <th>Amount</th>
                <th>Pool %</th>
                <th>Sample $2.4k month</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.fanName}
                    <div className="muted">{i.fanEmail}</div>
                  </td>
                  <td>{money(i.amount)}</td>
                  <td>{pct(i.fanFraction, 2)}</td>
                  <td>
                    {money(
                      fanPeriodPayout(
                        i.amount,
                        listing.terms.R,
                        listing.terms.S,
                        2400
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">
            If this month’s defined net were $2,400, the pool would get{" "}
            {money(samplePool)} (illustration only).
          </p>
        </div>
        <div>
          <PricingPanel listing={listing} />
          <div className="btn-row">
            <Link className="btn" href={`/listing/${listing.id}`}>
              Public listing
            </Link>
            <Link className="btn btn-outline" href="/artist/apply">
              Create another
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
