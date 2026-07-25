"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiGetListing } from "@/lib/api";
import { money, pct } from "@/lib/format";
import { useHasMounted, usePortfolio } from "@/lib/hooks";

export default function PortfolioPage() {
  const mounted = useHasMounted();
  const [email, setEmail] = useState("alex@example.com");
  const { investments, loading, error } = usePortfolio(email);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadNames() {
      const map: Record<string, string> = { ...names };
      await Promise.all(
        investments.map(async (inv) => {
          if (map[inv.listingId]) return;
          try {
            const data = await apiGetListing(inv.listingId);
            map[inv.listingId] = data.listing.profile.stageName;
          } catch {
            map[inv.listingId] = inv.listingId;
          }
        })
      );
      if (!cancelled) setNames(map);
    }
    void loadNames();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh names when investment set changes
  }, [investments]);

  if (!mounted) {
    return (
      <AppShell active="/portfolio">
        <p className="muted">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="/portfolio">
      <p className="eyebrow">Fan · portfolio · prototype</p>
      <h1>Simulated commitments</h1>
      <p className="lead">
        Look up prototype investments by email. Not a real brokerage account.
      </p>

      <div className="card" style={{ maxWidth: 420, marginBottom: "1.5rem" }}>
        <div className="field">
          <label htmlFor="email">Fan email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
        <p className="muted">Try sample: alex@example.com</p>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : investments.length === 0 ? (
        <div className="card">
          <p>No prototype commitments for that email yet.</p>
          <div className="btn-row">
            <Link className="btn" href="/browse">
              Browse offers
            </Link>
          </div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Amount</th>
              <th>Pool %</th>
              <th>Custody</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td>{names[inv.listingId] || "…"}</td>
                <td>{money(inv.amount)}</td>
                <td>{pct(inv.fanFraction, 2)}</td>
                <td>
                  <span className="badge badge-mid">
                    {inv.custody || "in_escrow"}
                  </span>
                </td>
                <td>
                  <Link href={`/listing/${inv.listingId}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AppShell>
  );
}
