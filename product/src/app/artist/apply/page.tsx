"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { money, pct } from "@/lib/format";
import { computePricing, suggestTermsFromRevenue } from "@/lib/pricing";
import { publishArtistListing } from "@/lib/store";
import type {
  IncomeCategory,
  OfferTerms,
  VerificationLevel,
} from "@/lib/types";

const STEPS = ["Profile", "Traction", "Revenue", "Terms", "Publish"] as const;

export default function ArtistApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const [stageName, setStageName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");
  const [raisePurpose, setRaisePurpose] = useState("");

  const [monthlyListeners, setMonthlyListeners] = useState(10000);
  const [growthRate6mo, setGrowthRate6mo] = useState(0.1);
  const [catalogReleases, setCatalogReleases] = useState(4);

  const [vann, setVann] = useState(12000);
  const [verification, setVerification] =
    useState<VerificationLevel>("document_backed");
  const [categories, setCategories] = useState<IncomeCategory[]>(["streaming"]);
  const [docsNote, setDocsNote] = useState("");

  const [terms, setTerms] = useState<OfferTerms>({
    R: 5000,
    S: 0.15,
    T: 36,
    C: 1.5,
  });

  const traction = useMemo(
    () => ({ monthlyListeners, growthRate6mo, catalogReleases }),
    [monthlyListeners, growthRate6mo, catalogReleases]
  );
  const revenue = useMemo(
    () => ({ vann, verification, categories, docsNote }),
    [vann, verification, categories, docsNote]
  );

  const pricing = useMemo(
    () => computePricing(revenue, traction, terms),
    [revenue, traction, terms]
  );

  function toggleCategory(cat: IncomeCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function applySuggestedRaise() {
    const suggested = suggestTermsFromRevenue(revenue, traction, terms);
    setTerms(suggested);
  }

  function next() {
    setError("");
    if (step === 0 && (!stageName.trim() || !email.trim())) {
      setError("Stage name and email are required.");
      return;
    }
    if (step === 2 && vann <= 0) {
      setError("Enter annual defined net greater than zero.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  function onPublish(e: FormEvent) {
    e.preventDefault();
    setError("");
    const result = publishArtistListing({
      stageName,
      legalName,
      email,
      genre,
      location,
      bio,
      links,
      raisePurpose,
      monthlyListeners,
      growthRate6mo,
      catalogReleases,
      vann,
      verification,
      categories,
      docsNote,
      terms,
    });
    if (result.error || !result.listing) {
      setError(result.error || "Could not publish.");
      return;
    }
    router.push(`/listing/${result.listing.id}`);
  }

  return (
    <AppShell active="/artist/apply">
      <p className="eyebrow">Artist · list yourself</p>
      <h1>Create your Muse offer</h1>
      <p className="lead">
        Five steps from profile to a live listing. Muse runs pricing on your
        inputs and flags incoherent terms.
      </p>

      <div className="steps">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`step-pill ${i === step ? "active" : ""} ${
              i < step ? "done" : ""
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <form className="grid-2" onSubmit={onPublish}>
        <div className="card">
          {step === 0 && (
            <>
              <h2>Profile</h2>
              <div className="field-row">
                <div className="field">
                  <label>Stage name</label>
                  <input
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Legal name</label>
                  <input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Genre</label>
                  <input value={genre} onChange={(e) => setGenre(e.target.value)} />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="field">
                <label>Links</label>
                <input value={links} onChange={(e) => setLinks(e.target.value)} />
              </div>
              <div className="field">
                <label>What is the raise for?</label>
                <input
                  value={raisePurpose}
                  onChange={(e) => setRaisePurpose(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>Traction</h2>
              <div className="field">
                <label>Monthly listeners</label>
                <input
                  type="number"
                  min={0}
                  value={monthlyListeners}
                  onChange={(e) => setMonthlyListeners(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>6-month growth (e.g. 0.18 = +18%)</label>
                <input
                  type="number"
                  step={0.01}
                  value={growthRate6mo}
                  onChange={(e) => setGrowthRate6mo(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Catalog releases</label>
                <input
                  type="number"
                  min={0}
                  value={catalogReleases}
                  onChange={(e) => setCatalogReleases(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Revenue</h2>
              <div className="field">
                <label>Annual defined net V_ann (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={vann}
                  onChange={(e) => setVann(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Verification level</label>
                <select
                  value={verification}
                  onChange={(e) =>
                    setVerification(e.target.value as VerificationLevel)
                  }
                >
                  <option value="self_reported">Self-reported</option>
                  <option value="document_backed">Document-backed</option>
                  <option value="linked">Linked (future)</option>
                </select>
              </div>
              <div className="field">
                <label>Included categories</label>
                {(["streaming", "sync", "merch", "live"] as IncomeCategory[]).map(
                  (cat) => (
                    <label className="field-check" key={cat}>
                      <input
                        type="checkbox"
                        checked={categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      {cat}
                    </label>
                  )
                )}
              </div>
              <div className="field">
                <label>Docs note</label>
                <input
                  value={docsNote}
                  onChange={(e) => setDocsNote(e.target.value)}
                  placeholder="e.g. DistroKid 2025 statement uploaded"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Offer terms</h2>
              <div className="field-row">
                <div className="field">
                  <label>Raise R ($)</label>
                  <input
                    type="number"
                    min={500}
                    value={terms.R}
                    onChange={(e) =>
                      setTerms({ ...terms, R: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="field">
                  <label>Share S (0–1)</label>
                  <input
                    type="number"
                    min={0.05}
                    max={0.35}
                    step={0.01}
                    value={terms.S}
                    onChange={(e) =>
                      setTerms({ ...terms, S: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Term T (months)</label>
                  <input
                    type="number"
                    min={12}
                    max={60}
                    value={terms.T}
                    onChange={(e) =>
                      setTerms({ ...terms, T: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="field">
                  <label>Cap C (×)</label>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    step={0.1}
                    value={terms.C}
                    onChange={(e) =>
                      setTerms({ ...terms, C: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={applySuggestedRaise}
              >
                Use suggested raise ({money(pricing.Rsuggested)})
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <h2>Publish</h2>
              <p className="muted">
                {pricing.coherent
                  ? "Terms look coherent — listing will go live immediately in this backbone."
                  : "Terms need review — listing will be saved as pending_review (still visible to you on the dashboard)."}
              </p>
              <table className="table">
                <tbody>
                  <tr>
                    <th>Artist</th>
                    <td>{stageName}</td>
                  </tr>
                  <tr>
                    <th>Raise</th>
                    <td>
                      {money(terms.R)} · {pct(terms.S)} · {terms.T} mo ·{" "}
                      {terms.C}×
                    </td>
                  </tr>
                  <tr>
                    <th>V_adj</th>
                    <td>{money(pricing.Vadj)}</td>
                  </tr>
                  <tr>
                    <th>Risk</th>
                    <td>{pricing.risk}</td>
                  </tr>
                </tbody>
              </table>
              <button className="btn" type="submit" style={{ width: "100%" }}>
                Publish listing
              </button>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <div className="btn-row">
            {step > 0 && (
              <button type="button" className="btn btn-outline" onClick={back}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button type="button" className="btn" onClick={next}>
                Continue
              </button>
            )}
          </div>
        </div>

        <aside className="card">
          <h2>Live pricing</h2>
          <div className="formula">
            Q = {pricing.Q.toFixed(2)} · G = {pricing.G.toFixed(2)}
            <br />
            V_adj = {money(pricing.Vadj)}
            <br />
            R_suggested ≈ {money(pricing.Rsuggested)}
            <br />
            V_implied = {money(pricing.Vimplied)}
          </div>
          <p className="muted">
            Status:{" "}
            {pricing.coherent ? (
              <span className="badge badge-ok">Coherent</span>
            ) : (
              <span className="badge badge-warn">Needs review</span>
            )}{" "}
            · risk {pricing.risk}
          </p>
          {pricing.notes.length > 0 && (
            <ul className="muted" style={{ paddingLeft: "1.1rem" }}>
              {pricing.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          <p className="muted" style={{ marginTop: "1rem" }}>
            Already listed?{" "}
            <Link href="/artist/dashboard">Open dashboard</Link>
          </p>
        </aside>
      </form>
    </AppShell>
  );
}
