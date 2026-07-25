/** Muse product domain — backbone types */

export type VerificationLevel = "self_reported" | "document_backed" | "linked";

export type IncomeCategory = "streaming" | "sync" | "merch" | "live";

export type OfferStatus =
  | "draft"
  | "pending_review"
  | "live"
  | "funded"
  | "closed";

/**
 * Simulated fiat escrow — platform holds fan funds until release rules fire.
 * Not blockchain; not real money movement.
 */
export type EscrowStatus =
  | "collecting" // raise open, funds accumulating in escrow
  | "holding" // raise closed/funded, still in platform escrow
  | "released" // net raise sent to artist (sim)
  | "refunded"; // prototype refund path

export type CustodyStatus =
  | "in_escrow"
  | "released_to_artist"
  | "refunded";

export type RiskLabel = "higher" | "medium" | "lower";

export interface ArtistProfile {
  id: string;
  createdAt: string;
  stageName: string;
  legalName: string;
  email: string;
  genre: string;
  location: string;
  bio: string;
  links: string;
  raisePurpose: string;
}

export interface TractionInputs {
  monthlyListeners: number;
  growthRate6mo: number; // e.g. 0.18 = +18%
  catalogReleases: number;
}

export interface RevenueInputs {
  vann: number; // annual defined net
  verification: VerificationLevel;
  categories: IncomeCategory[];
  docsNote: string;
}

export interface OfferTerms {
  R: number; // raise
  S: number; // share 0–1
  T: number; // months
  C: number; // cap multiple
}

export interface PricingSnapshot {
  Q: number;
  G: number;
  Vadj: number;
  Rsuggested: number;
  Vimplied: number;
  risk: RiskLabel;
  coherent: boolean;
  notes: string[];
}

export interface Listing {
  id: string;
  artistId: string;
  createdAt: string;
  updatedAt: string;
  status: OfferStatus;
  profile: ArtistProfile;
  traction: TractionInputs;
  revenue: RevenueInputs;
  terms: OfferTerms;
  pricing: PricingSnapshot;
  raisedAmount: number;
  /** Auto-approve in local backbone for demos */
  autoApproved: boolean;
  /** Escrow (simulated fiat custody) */
  escrowStatus: EscrowStatus;
  /** Fan funds currently held by Muse prototype escrow */
  escrowBalance: number;
  /** Net amount marked released to artist */
  artistReleasedAmount: number;
  /** Platform raise fee taken at release */
  platformFeeCollected: number;
  raiseClosedAt?: string;
  escrowReleasedAt?: string;
}

export interface Investment {
  id: string;
  listingId: string;
  createdAt: string;
  fanName: string;
  fanEmail: string;
  amount: number;
  /** amount / R at time of invest */
  fanFraction: number;
  status: "interest" | "committed";
  /** Where this commitment sits in the escrow flow */
  custody: CustodyStatus;
}

/** Audit trail for simulated escrow movements */
export interface EscrowEvent {
  id: string;
  listingId: string;
  createdAt: string;
  type:
    | "deposit"
    | "raise_closed"
    | "release_to_artist"
    | "platform_fee"
    | "note";
  amount: number;
  note: string;
}

/** Simulated payout period — no real money moves */
export interface PayoutCycle {
  id: string;
  listingId: string;
  createdAt: string;
  periodLabel: string;
  definedNet: number;
  poolAmount: number;
  /** per-fan simulated amounts */
  distributions: {
    investmentId: string;
    fanEmail: string;
    fanName: string;
    amount: number;
  }[];
  note: string;
}

export type DocumentCategory =
  | "distributor_statement"
  | "tax_return"
  | "bank_export"
  | "other";

/** Prototype financial document metadata (file may be local or Supabase Storage) */
export interface ArtistDocument {
  id: string;
  listingId: string;
  artistId: string;
  createdAt: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  category: DocumentCategory;
  /** local relative path or supabase storage path */
  storagePath: string;
  /** true only after human review — always false on upload in prototype */
  verified: boolean;
  backend: "local" | "supabase";
}

export interface MuseStore {
  version: 1;
  listings: Listing[];
  investments: Investment[];
  payouts: PayoutCycle[];
  documents: ArtistDocument[];
  escrowEvents: EscrowEvent[];
  currentArtistId: string | null;
  currentFanEmail: string | null;
}

export interface ArtistDraft {
  profile: Partial<ArtistProfile>;
  traction: Partial<TractionInputs>;
  revenue: Partial<RevenueInputs>;
  terms: Partial<OfferTerms>;
}
