import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/">
      <p className="eyebrow">Product app · in development</p>
      <h1>Build the Muse loop end to end — still a prototype.</h1>
      <p className="lead">
        List an offer, simulate fan commitments, review pending listings, and
        run a fake revenue → payout cycle. Nothing here moves real money.
      </p>

      <div className="callout">
        Start with a <Link href="/session">prototype session</Link> (fan /
        artist / admin), then walk the flows below.
      </div>

      <div className="grid-3" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h2>1. Artist</h2>
          <p className="muted">Apply → pricing → publish (or pending review).</p>
          <div className="btn-row">
            <Link className="btn" href="/artist/apply">
              List yourself
            </Link>
          </div>
        </div>
        <div className="card">
          <h2>2. Fan</h2>
          <p className="muted">Browse live offers and simulate a commitment.</p>
          <div className="btn-row">
            <Link className="btn btn-ink" href="/browse">
              Browse
            </Link>
          </div>
        </div>
        <div className="card">
          <h2>3. Ops</h2>
          <p className="muted">Approve pending listings; report sample revenue.</p>
          <div className="btn-row">
            <Link className="btn btn-outline" href="/admin">
              Admin queue
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
