import type {
  OfferTerms,
  PricingSnapshot,
  RevenueInputs,
  RiskLabel,
  TractionInputs,
  VerificationLevel,
} from "./types";

/** Policy guardrails for the local backbone */
export const POLICY = {
  S_min: 0.05,
  S_max: 0.35,
  T_min: 12,
  T_max: 60,
  C_min: 1.0,
  C_max: 3.0,
  R_min: 500,
  R_max: 250_000,
  /** Max raise as multiple of adjusted annual revenue */
  maxRaiseToVadj: 0.6,
  raiseFeeRate: 0.06,
  payoutFeeRate: 0.03,
} as const;

export function qualityFromVerification(v: VerificationLevel): number {
  switch (v) {
    case "self_reported":
      return 0.6;
    case "document_backed":
      return 0.9;
    case "linked":
      return 1.0;
  }
}

/**
 * Traction factor G — bounded so it cannot invent revenue.
 * Pilots can override; this is the default formula.
 */
export function tractionFactor(t: TractionInputs): number {
  const listeners = Math.max(0, t.monthlyListeners);
  const growth = t.growthRate6mo;
  const releases = Math.max(0, t.catalogReleases);

  // Log-ish listener score: 1k→~0.85, 10k→~0.95, 50k→~1.05, 200k→~1.15
  const listenerScore =
    listeners <= 0 ? 0.75 : Math.min(1.2, 0.75 + Math.log10(listeners + 10) / 10);

  const growthScore = Math.min(1.2, Math.max(0.8, 1 + growth * 0.5));
  const releaseScore = Math.min(1.1, 0.9 + Math.min(releases, 10) * 0.02);

  const raw = listenerScore * 0.5 + growthScore * 0.35 + releaseScore * 0.15;
  return clamp(raw, 0.7, 1.3);
}

export function computePricing(
  revenue: RevenueInputs,
  traction: TractionInputs,
  terms: OfferTerms
): PricingSnapshot {
  const Q = qualityFromVerification(revenue.verification);
  const G = tractionFactor(traction);
  const Vadj = revenue.vann * Q * G;
  const notes: string[] = [];

  const Rsuggested =
    terms.C > 0
      ? (terms.S * Vadj * (terms.T / 12)) / terms.C
      : terms.S * Vadj * (terms.T / 12);

  const Vimplied = terms.S > 0 ? terms.R / terms.S : 0;

  let coherent = true;

  if (terms.R < POLICY.R_min || terms.R > POLICY.R_max) {
    coherent = false;
    notes.push(`Raise must be between $${POLICY.R_min} and $${POLICY.R_max}.`);
  }
  if (terms.S < POLICY.S_min || terms.S > POLICY.S_max) {
    coherent = false;
    notes.push(
      `Share S must be between ${POLICY.S_min * 100}% and ${POLICY.S_max * 100}%.`
    );
  }
  if (terms.T < POLICY.T_min || terms.T > POLICY.T_max) {
    coherent = false;
    notes.push(`Term must be ${POLICY.T_min}–${POLICY.T_max} months.`);
  }
  if (terms.C < POLICY.C_min || terms.C > POLICY.C_max) {
    coherent = false;
    notes.push(`Cap C must be ${POLICY.C_min}–${POLICY.C_max}×.`);
  }
  if (Vadj > 0 && terms.R / Vadj > POLICY.maxRaiseToVadj) {
    coherent = false;
    notes.push(
      `Raise is high vs adjusted revenue (max ~${POLICY.maxRaiseToVadj * 100}% of V_adj).`
    );
  }
  if (revenue.verification === "self_reported") {
    notes.push("Self-reported revenue is high risk — prefer document-backed.");
  }
  if (Math.abs(terms.R - Rsuggested) / Math.max(Rsuggested, 1) > 0.35) {
    notes.push(
      `Listed raise differs >35% from suggested $${Math.round(Rsuggested).toLocaleString()}.`
    );
  }

  const risk = riskLabel(Q, G, terms, Vadj, coherent);

  return {
    Q,
    G,
    Vadj,
    Rsuggested,
    Vimplied,
    risk,
    coherent,
    notes,
  };
}

function riskLabel(
  Q: number,
  G: number,
  terms: OfferTerms,
  Vadj: number,
  coherent: boolean
): RiskLabel {
  if (!coherent || Q < 0.7) return "higher";
  const aggressiveness = Vadj > 0 ? terms.R / Vadj : 1;
  if (Q >= 0.9 && aggressiveness < 0.35 && G >= 0.95) return "lower";
  return "medium";
}

export function fanFraction(amount: number, R: number): number {
  if (R <= 0) return 0;
  return amount / R;
}

export function periodPoolPayout(S: number, definedNet: number): number {
  return S * definedNet;
}

export function fanPeriodPayout(
  amount: number,
  R: number,
  S: number,
  definedNet: number
): number {
  return fanFraction(amount, R) * periodPoolPayout(S, definedNet);
}

export function maxPoolPayout(R: number, C: number): number {
  return R * C;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function suggestTermsFromRevenue(
  revenue: RevenueInputs,
  traction: TractionInputs,
  preferred: Partial<OfferTerms> = {}
): OfferTerms {
  const S = preferred.S ?? 0.15;
  const T = preferred.T ?? 36;
  const C = preferred.C ?? 1.5;
  const pricing = computePricing(revenue, traction, {
    R: preferred.R ?? 1000,
    S,
    T,
    C,
  });
  const R = preferred.R ?? Math.max(POLICY.R_min, Math.round(pricing.Rsuggested / 100) * 100);
  return { R, S, T, C };
}
