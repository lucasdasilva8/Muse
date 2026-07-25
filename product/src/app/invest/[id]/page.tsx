"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { apiInvest } from "@/lib/api";
import { readClientSession } from "@/lib/clientSession";
import { money, pct } from "@/lib/format";
import { useHasMounted, useListingDetail } from "@/lib/hooks";
import { fanFraction, fanPeriodPayout } from "@/lib/pricing";

export default function InvestPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const mounted = useHasMounted();
  const { listing, loading, error: loadError, refresh } = useListingDetail(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = readClientSession();
    if (s.name) setName(s.name);
    if (s.email) setEmail(s.email);
  }, []);

  const fraction = useMemo(() => {
    if (!listing) return 0;
    return fanFraction(amount, listing.terms.R);
  }, [amount, listing]);

  const samplePayout = useMemo(() => {
    if (!listing) return 0;
    return fanPeriodPayout(amount, listing.terms.R, listing.terms.S, 2400);
  }, [amount, listing]);

  if (!mounted || loading) {
    return (
      <AppShell>
        <p className="muted">Loading…</p>
      </AppShell>
    );
  }

  if (loadError || !listing) {
    return (
      <AppShell>
        <h1>Listing not found</h1>
        <p className="error">{loadError}</p>
        <Link className="btn" href="/browse">
          Browse
        </Link>
      </AppShell>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const result = await apiInvest({
        listingId: id,
        fanName: name,
        fanEmail: email,
        amount,
      });
      setNotice(
        result.notice ||
          "Prototype commitment recorded — no payment processed."
      );
      setDone(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invest");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell active="/browse">
      <p className="eyebrow">Invest · prototype</p>
      <h1>Simulate backing {listing.profile.stageName}</h1>
      <p className="lead">
        Submits to <code>/api/invest</code>. Records a fake commitment held in
        simulated Muse escrow. <strong>No card is charged.</strong>
      </p>

      <div className="grid-2">
        <form className="card" onSubmit={onSubmit}>
          {done ? (
            <div className="callout-ok callout">
              <strong>Prototype commitment saved.</strong>
              <p style={{ marginTop: "0.5rem" }}>
                {money(amount)} → {pct(fraction, 2)} of the fan pool.
              </p>
              {notice && <p className="muted">{notice}</p>}
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
                  {money(samplePayout)} before fees (illustration only).
                </p>
              </div>

              {error && <p className="error">{error}</p>}

              <button
                className="btn"
                type="submit"
                style={{ width: "100%" }}
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Confirm prototype commitment"}
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
          <div className="callout">
            Not fully functioning: no escrow, KYC, or payment processor.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
