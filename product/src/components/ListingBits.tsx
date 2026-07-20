import type { Listing } from "@/lib/types";
import { money, pct } from "@/lib/format";

export function RiskBadge({ risk }: { risk: Listing["pricing"]["risk"] }) {
  if (risk === "higher") return <span className="badge badge-warn">Higher risk</span>;
  if (risk === "lower") return <span className="badge badge-ok">Lower risk</span>;
  return <span className="badge badge-mid">Medium risk</span>;
}

export function VerificationBadge({
  level,
}: {
  level: Listing["revenue"]["verification"];
}) {
  if (level === "document_backed")
    return <span className="badge badge-ok">Document-backed</span>;
  if (level === "linked") return <span className="badge badge-ok">Linked</span>;
  return <span className="badge badge-warn">Self-reported</span>;
}

export function RaiseProgress({ listing }: { listing: Listing }) {
  const pctRaised = Math.min(100, (listing.raisedAmount / listing.terms.R) * 100);
  return (
    <div>
      <div className="progress">
        <span style={{ width: `${pctRaised}%` }} />
      </div>
      <p className="muted">
        {money(listing.raisedAmount)} of {money(listing.terms.R)} ·{" "}
        {pctRaised.toFixed(0)}% · {listing.status}
      </p>
    </div>
  );
}

export function PricingPanel({ listing }: { listing: Listing }) {
  const p = listing.pricing;
  const t = listing.terms;
  return (
    <div className="card">
      <h2>Pricing snapshot</h2>
      <div className="formula">
        V_adj = {money(listing.revenue.vann)} × Q {p.Q.toFixed(2)} × G{" "}
        {p.G.toFixed(2)} = {money(p.Vadj)}
        <br />
        R_suggested = (S {pct(t.S)} × V_adj × T/12) / C ≈ {money(p.Rsuggested)}
        <br />
        V_implied = R / S = {money(p.Vimplied)}
      </div>
      <p>
        <RiskBadge risk={p.risk} />
        {!p.coherent && <span className="badge badge-warn">Needs review</span>}
      </p>
      {p.notes.length > 0 && (
        <ul className="muted" style={{ marginTop: "0.75rem", paddingLeft: "1.1rem" }}>
          {p.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
