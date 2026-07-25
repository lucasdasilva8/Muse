"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  PricingPanel,
  RaiseProgress,
  RiskBadge,
  VerificationBadge,
} from "@/components/ListingBits";
import { apiListPayouts, apiSimulatePayout } from "@/lib/api";
import { DocumentPanel } from "@/components/DocumentPanel";
import { EscrowPanel } from "@/components/EscrowPanel";
import { money, pct } from "@/lib/format";
import { useArtistDashboard, useHasMounted } from "@/lib/hooks";
import { fanPeriodPayout } from "@/lib/pricing";
import type { PayoutCycle } from "@/lib/types";

export default function ArtistDashboardPage() {
  const mounted = useHasMounted();
  const { listings, investments, currentArtistId, loading, error, refresh } =
    useArtistDashboard();

  const listing = listings[0];
  const [definedNet, setDefinedNet] = useState(2400);
  const [periodLabel, setPeriodLabel] = useState("");
  const [payouts, setPayouts] = useState<PayoutCycle[]>([]);
  const [payoutNotice, setPayoutNotice] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!listing) return;
    void apiListPayouts(listing.id)
      .then((d) => setPayouts(d.payouts))
      .catch(() => setPayouts([]));
  }, [listing]);

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

  async function onReport(e: FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setPayoutError("");
    setPayoutNotice("");
    setBusy(true);
    try {
      const result = await apiSimulatePayout({
        listingId: listing.id,
        definedNet,
        periodLabel: periodLabel || undefined,
      });
      setPayoutNotice(result.notice || "Payout simulated.");
      const list = await apiListPayouts(listing.id);
      setPayouts(list.payouts);
      await refresh();
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

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
          <div className="label">In escrow</div>
          <div className="value">{money(listing.escrowBalance)}</div>
          <p className="muted">{listing.escrowStatus}</p>
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
            </tbody>
          </table>

          <h2>Simulated investors</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Fan</th>
                <th>Amount</th>
                <th>Custody</th>
                <th>If net $2.4k</th>
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
                  <td>
                    <span className="badge badge-mid">{i.custody}</span>
                  </td>
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

          <EscrowPanel listing={listing} canAct onUpdated={refresh} />

          <DocumentPanel listingId={listing.id} canUpload />

          <h2 style={{ marginTop: "1.5rem" }}>Report revenue (simulate payout)</h2>
          <form className="card" onSubmit={onReport}>
            <div className="field">
              <label>Period label</label>
              <input
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                placeholder="e.g. 2026-Q2"
              />
            </div>
            <div className="field">
              <label>Defined net for period (USD)</label>
              <input
                type="number"
                min={0}
                value={definedNet}
                onChange={(e) => setDefinedNet(Number(e.target.value))}
              />
            </div>
            <p className="muted">
              Pool gets {pct(listing.terms.S)} × net ={" "}
              {money(listing.terms.S * definedNet)} split by fan fractions.
            </p>
            {payoutError && <p className="error">{payoutError}</p>}
            {payoutNotice && <p className="callout-ok callout">{payoutNotice}</p>}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Simulating…" : "Run prototype payout"}
            </button>
          </form>

          {payouts.length > 0 && (
            <>
              <h2 style={{ marginTop: "1.25rem" }}>Payout history (sim)</h2>
              {payouts.map((p) => (
                <div className="card" key={p.id} style={{ marginBottom: "0.75rem" }}>
                  <strong>{p.periodLabel}</strong>
                  <p className="muted">
                    Net {money(p.definedNet)} → pool {money(p.poolAmount)}
                  </p>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fan</th>
                        <th>Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.distributions.map((d) => (
                        <tr key={d.investmentId}>
                          <td>{d.fanName}</td>
                          <td>{money(d.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}
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
