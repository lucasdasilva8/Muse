import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/" fullBleed>
      <header className="hero">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="container">
          <p className="hero-brand">MUSE</p>
          <h1>Invest in artists. Earn when they do.</h1>
          <p className="hero-lead">
            Prototype product loop — list an offer, simulate fan commitments,
            review terms, and run a fake payout. No real money moves here.
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/browse">
              Browse artists
            </Link>
            <Link className="btn btn-secondary" href="/artist/apply">
              List your music
            </Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <p className="eyebrow">The gap</p>
          <h2 className="page-title" style={{ maxWidth: "22ch" }}>
            Artists need capital. Fans already spend. Neither side gets a fair
            structure.
          </h2>
          <div className="narrative">
            <p>
              This app is the working prototype of Muse: artists publish a
              revenue-share offer; fans commit amounts into the raise; both sides
              see the same pricing math.
            </p>
            <p>
              Start with a{" "}
              <Link href="/session" style={{ textDecoration: "underline" }}>
                prototype session
              </Link>{" "}
              (fan, artist, or admin), then walk the loop below.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <p className="eyebrow">How a Muse share works</p>
          <h2 className="page-title">You set the split. We structure the price.</h2>
          <p className="section-lead">
            Same story as the marketing site — built here as clickable flows.
          </p>
          <div className="process">
            <div className="process-step">
              <div className="process-num">01</div>
              <div>
                <h3>Artist opens an offer</h3>
                <p>
                  Raise, share %, term, and cap — plus which income categories
                  are included.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">02</div>
              <div>
                <h3>Muse verifies &amp; prices</h3>
                <p>
                  Traction and disclosed revenue feed a suggested raise and risk
                  label (prototype checks).
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">03</div>
              <div>
                <h3>Fans fund the raise</h3>
                <p>
                  Each fan owns a fraction of the pool equal to what they put in
                  versus the total raise.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">04</div>
              <div>
                <h3>Payouts when revenue hits</h3>
                <p>
                  Simulate a period’s defined net and split the fan pool — still
                  no real transfers.
                </p>
              </div>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: "2rem" }}>
            <Link className="btn btn-ink" href="/artist/apply">
              Put yourself on Muse
            </Link>
            <Link className="btn btn-outline" href="/admin">
              Admin queue
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Trust</p>
          <h2 className="page-title">Built to make revenue reporting believable.</h2>
          <div className="grid-3" style={{ marginTop: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>
                Traction checks
              </h3>
              <p className="muted">
                Listener and growth inputs reviewed before a listing goes live.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>
                Document stubs
              </h3>
              <p className="muted">
                Upload distributor statements — stored and flagged, not
                auto-audited yet.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>
                Clear terms
              </h3>
              <p className="muted">
                Share %, term, cap, and fees stay visible on every offer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
