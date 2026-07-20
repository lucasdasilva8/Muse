"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { money, pct } from "@/lib/format";
import { useHasMounted, useListing } from "@/lib/hooks";
import { fanFraction, fanPeriodPayout } from "@/lib/pricing";
import { investInListing } from "@/lib/store";

export default function InvestPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const mounted = useHasMounted();
  const listing = useListing(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const fraction = useMemo(() => {
    if (!listing) return 0;
    return fanFraction(amount, listing.terms.R);
  }, [amount, listing]);

  const samplePayout = useMemo(() => {
    if (!listing) return 0;
    return fanPeriodPayout(amount, listing.terms.R, listing.terms.S, 2400);
  }, [amount, listing]);

  if (!mounted) {
    return (
      <AppShell>
        <p className="muted">Loading…</p>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell>
        <h1>Listing not found</h1>
        <Link className="btn" href="/browse">
          Browse
        </Link>
      </AppShell>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = investInListing({
      listingId: id,
      fanName: name,
      fanEmail: email,
      amount,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <AppShell active="/browse">
      <p className="eyebrow">Invest</p>
      <h1>Back {listing.profile.stageName}</h1>
      <p className="lead">
        Commit an amount into the raise. Your pool fraction is amount ÷ R. This
        writes to the local Muse store (no payment processor yet).
      </p>

      <div className="grid-2">
        <form className="card" onSubmit={onSubmit}>
          {done ? (
            <div className="callout-ok callout">
              <strong>Committed in prototype.</strong>
              <p style={{ marginTop: "0.5rem" }}>
                {money(amount)} → {pct(fraction, 2)} of the fan pool.
              </p>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => router.push("/portfolio")}
                >
                  View portfolio
                </button>
                <Link className="btn btn-outline" href={`/listing/${id}`}>
                  Back to listing
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="amount">Amount (USD)</label>
                <input
                  id="amount"
                  type="number"
                  min={25}
                  step={25}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <div className="callout-ok callout">
                <strong>
                  {money(amount)} → {pct(fraction, 2)} of the fan pool
                </strong>
                <p style={{ marginTop: "0.35rem" }}>
                  If defined net were $2,400 this period, you’d receive about{" "}
                  {money(samplePayout)} before fees.
                </p>
              </div>

              {error && <p className="error">{error}</p>}

              <button className="btn" type="submit" style={{ width: "100%" }}>
                Confirm commitment
              </button>
            </>
          )}
        </form>

        <aside className="card">
          <h2>Terms</h2>
          <table className="table">
            <tbody>
              <tr>
                <th>Raise</th>
                <td>{money(listing.terms.R)}</td>
              </tr>
              <tr>
                <th>Remaining</th>
                <td>{money(listing.terms.R - listing.raisedAmount)}</td>
              </tr>
              <tr>
                <th>Share</th>
                <td>{pct(listing.terms.S)}</td>
              </tr>
              <tr>
                <th>Term / cap</th>
                <td>
                  {listing.terms.T} mo · {listing.terms.C}×
                </td>
              </tr>
            </tbody>
          </table>
          <div className="formula">
            fan_fraction = amount / R
            <br />
            period_payout = fan_fraction × (S × defined_net)
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
