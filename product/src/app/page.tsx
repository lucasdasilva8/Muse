import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/">
      <p className="eyebrow">Product backbone</p>
      <h1>List yourself. Let fans invest. Track the pool.</h1>
      <p className="lead">
        This app is the working skeleton for Muse: artists publish a revenue-share
        offer using the pricing engine; fans commit amounts into the raise; both
        sides see the same math. Data is stored locally in your browser for now.
      </p>

      <div className="grid-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h2>Artists</h2>
          <p className="muted">
            Enter traction + revenue → set R / S / T / C → see Muse pricing →
            publish a live listing.
          </p>
          <div className="btn-row">
            <Link className="btn" href="/artist/apply">
              Put yourself on Muse
            </Link>
            <Link className="btn btn-outline" href="/artist/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
        <div className="card">
          <h2>Fans</h2>
          <p className="muted">
            Browse live offers, invest an amount, and track your pool fraction in
            a portfolio.
          </p>
          <div className="btn-row">
            <Link className="btn btn-ink" href="/browse">
              Browse listings
            </Link>
            <Link className="btn btn-outline" href="/portfolio">
              Portfolio
            </Link>
          </div>
        </div>
      </div>

      <div className="callout" style={{ marginTop: "2rem" }}>
        Backbone only: no Stripe yet, no legal offering, no server database.
        Next step after this is auth + Postgres + escrow rails.
      </div>
    </AppShell>
  );
}
