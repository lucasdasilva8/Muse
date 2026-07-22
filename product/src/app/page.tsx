import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="/" home>
      <header className="hero">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="container">
          <p className="hero-brand">MUSE</p>
          <h1>Invest in artists. Earn when they do.</h1>
          <p className="hero-lead">
            Prototype product loop — list an offer, simulate fan commitments,
            review terms, and run a sample payout. No real money moves here.
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
          <h2>Artists need capital. Fans already spend. Neither side gets a fair structure.</h2>
          <div className="narrative">
            <p>
              Underground and independent artists often need money upfront to keep
              creating. Fans already support them — but usually with no path to a
              return.
            </p>
            <p>
              This prototype shows how Muse would turn that support into a
              structured revenue share: verified inputs, clear terms, and
              simulated commitments.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-elevated">
        <div className="container">
          <p className="eyebrow">Product loop</p>
          <h2>Walk the full flow in this app.</h2>
          <p className="section-lead">
            Same story as the marketing site — wired to working prototype APIs.
          </p>
          <div className="process">
            <div className="process-step">
              <div className="process-num">01</div>
              <div>
                <h3>Set a session</h3>
                <p>
                  Continue as fan, artist, or admin — demo identity only, not
                  real login.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">02</div>
              <div>
                <h3>Artist publishes an offer</h3>
                <p>
                  Traction, revenue, and terms run through Muse pricing — live
                  or pending review.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">03</div>
              <div>
                <h3>Fans simulate a commitment</h3>
                <p>
                  Browse listings, invest a sample amount, track pool fraction in
                  portfolio.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">04</div>
              <div>
                <h3>Report revenue &amp; payout</h3>
                <p>
                  Artists run a fake period net; the pool split shows what fans
                  would receive.
                </p>
              </div>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: "2rem" }}>
            <Link className="btn btn-ink" href="/session">
              Start with session
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
          <h2>Built to make the process readable.</h2>
          <div className="process">
            <div className="process-step">
              <div className="process-num">01</div>
              <div>
                <h3>Pricing on the page</h3>
                <p>Q, G, V_adj, and suggested raise stay visible — no black box.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">02</div>
              <div>
                <h3>Document stubs</h3>
                <p>
                  Upload sample financial docs; admins can mark them verified in
                  the prototype.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-num">03</div>
              <div>
                <h3>Clear non-goals</h3>
                <p>
                  No Stripe, no escrow, no legal offering yet — every screen says
                  so.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
