"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { money, pct } from "@/lib/format";
import { useHasMounted, useMuseStore } from "@/lib/hooks";

export default function PortfolioPage() {
  const mounted = useHasMounted();
  const store = useMuseStore();
  const [email, setEmail] = useState(store.currentFanEmail || "");

  const investments = useMemo(() => {
    const e = email.trim().toLowerCase();
    if (!e) return [];
    return store.investments.filter((i) => i.fanEmail.toLowerCase() === e);
  }, [email, store.investments]);

  if (!mounted) {
    return (
      <AppShell active="/portfolio">
        <p className="muted">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="/portfolio">
      <p className="eyebrow">Fan · portfolio</p>
      <h1>Your commitments</h1>
      <p className="lead">
        Look up investments by the email you used when committing. In a later
        version this will be account-based.
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
        <p className="muted">Try a sample: alex@example.com</p>
      </div>

      {investments.length === 0 ? (
        <div className="card">
          <p>No commitments for that email yet.</p>
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
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => {
              const listing = store.listings.find((l) => l.id === inv.listingId);
              return (
                <tr key={inv.id}>
                  <td>{listing?.profile.stageName || inv.listingId}</td>
                  <td>{money(inv.amount)}</td>
                  <td>{pct(inv.fanFraction, 2)}</td>
                  <td>{inv.status}</td>
                  <td>
                    {listing && (
                      <Link href={`/listing/${listing.id}`}>Open</Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </AppShell>
  );
}
