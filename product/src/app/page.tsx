import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/">
      <p className="eyebrow">Prototype product</p>
      <h1>List yourself. Simulate fan commitments.</h1>
      <p className="lead">
        This is a working prototype of Muse’s listing and invest flows. It uses a
        local JSON “database” and HTTP APIs so you can see the backbone — but it
        is <strong>not fully functioning</strong>: no Stripe, no auth, no legal
        offering, no real money.
      </p>

      <div className="callout">
        Treat every “Invest” / “Publish” action as a demo. Data can be reset.
        Do not collect real investor funds through this app.
      </div>

      <div className="grid-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h2>Artists (prototype)</h2>
          <p className="muted">
            Walk through apply → pricing → publish. Creates a simulated listing
            via <code>/api/listings/publish</code>.
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
          <h2>Fans (prototype)</h2>
          <p className="muted">
            Browse sample/live demos and simulate a commitment via{" "}
            <code>/api/invest</code> — no card charged.
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
    </AppShell>
  );
}
