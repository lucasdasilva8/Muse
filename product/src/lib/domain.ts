/**
 * Pure domain mutations — used by the prototype server DB.
 * Simulated fiat escrow only. No real payments, bank rails, or blockchain.
 */

import { computePricing, fanFraction, POLICY } from "./pricing";
import { createId, nowIso } from "./format";
import type {
  ArtistProfile,
  EscrowEvent,
  IncomeCategory,
  Investment,
  Listing,
  MuseStore,
  OfferTerms,
  PayoutCycle,
  RevenueInputs,
  TractionInputs,
  VerificationLevel,
} from "./types";

function pushEscrowEvent(
  events: EscrowEvent[],
  partial: Omit<EscrowEvent, "id" | "createdAt">
): EscrowEvent[] {
  return [
    {
      id: createId("escrow"),
      createdAt: nowIso(),
      ...partial,
    },
    ...events,
  ];
}

/** Backfill escrow fields for older local JSON / incomplete rows */
export function normalizeListing(listing: Listing): Listing {
  const raised = Number(listing.raisedAmount) || 0;
  const escrowBalance =
    listing.escrowBalance !== undefined
      ? Number(listing.escrowBalance)
      : listing.escrowStatus === "released"
        ? 0
        : raised;
  return {
    ...listing,
    escrowStatus: listing.escrowStatus ?? (raised > 0 ? "collecting" : "collecting"),
    escrowBalance,
    artistReleasedAmount: Number(listing.artistReleasedAmount) || 0,
    platformFeeCollected: Number(listing.platformFeeCollected) || 0,
  };
}

export function normalizeInvestment(inv: Investment): Investment {
  return {
    ...inv,
    custody: inv.custody ?? "in_escrow",
  };
}

export function normalizeStore(store: MuseStore): MuseStore {
  return {
    ...store,
    payouts: store.payouts ?? [],
    documents: store.documents ?? [],
    escrowEvents: store.escrowEvents ?? [],
    listings: (store.listings ?? []).map(normalizeListing),
    investments: (store.investments ?? []).map(normalizeInvestment),
  };
}

export interface PublishArtistInput {
  stageName: string;
  legalName: string;
  email: string;
  genre: string;
  location: string;
  bio: string;
  links: string;
  raisePurpose: string;
  monthlyListeners: number;
  growthRate6mo: number;
  catalogReleases: number;
  vann: number;
  verification: VerificationLevel;
  categories: IncomeCategory[];
  docsNote: string;
  terms: OfferTerms;
  forceLive?: boolean;
}

export function publishArtistListing(
  store: MuseStore,
  input: PublishArtistInput
): { store: MuseStore; listing?: Listing; error?: string } {
  const profile: ArtistProfile = {
    id: createId("artist"),
    createdAt: nowIso(),
    stageName: input.stageName.trim(),
    legalName: input.legalName.trim() || input.stageName.trim(),
    email: input.email.trim(),
    genre: input.genre.trim(),
    location: input.location.trim(),
    bio: input.bio.trim(),
    links: input.links.trim(),
    raisePurpose: input.raisePurpose.trim(),
  };

  const traction: TractionInputs = {
    monthlyListeners: Number(input.monthlyListeners) || 0,
    growthRate6mo: Number(input.growthRate6mo) || 0,
    catalogReleases: Number(input.catalogReleases) || 0,
  };

  const revenue: RevenueInputs = {
    vann: Number(input.vann) || 0,
    verification: input.verification,
    categories: input.categories.length ? input.categories : ["streaming"],
    docsNote: input.docsNote.trim(),
  };

  const terms = input.terms;
  const pricing = computePricing(revenue, traction, terms);

  if (!profile.stageName || !profile.email) {
    return { store, error: "Stage name and email are required." };
  }
  if (revenue.vann <= 0) {
    return { store, error: "Annual defined net (V_ann) must be greater than zero." };
  }

  const live = pricing.coherent || Boolean(input.forceLive);
  const listing: Listing = {
    id: createId("listing"),
    artistId: profile.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: live ? "live" : "pending_review",
    profile,
    traction,
    revenue,
    terms,
    pricing,
    raisedAmount: 0,
    autoApproved: live,
    escrowStatus: "collecting",
    escrowBalance: 0,
    artistReleasedAmount: 0,
    platformFeeCollected: 0,
  };
  return {
    listing,
    store: {
      ...store,
      listings: [listing, ...store.listings],
      currentArtistId: profile.id,
    },
  };
}

export function investInListing(
  store: MuseStore,
  input: {
    listingId: string;
    fanName: string;
    fanEmail: string;
    amount: number;
  }
): { store: MuseStore; investment?: Investment; error?: string } {
  const listing = store.listings.find((l) => l.id === input.listingId);
  if (!listing) return { store, error: "Listing not found." };
  if (listing.status !== "live") {
    return { store, error: "Listing is not open for investment (prototype)." };
  }

  const amount = Number(input.amount);
  if (!input.fanEmail.trim()) return { store, error: "Email is required." };
  if (!Number.isFinite(amount) || amount < 25) {
    return { store, error: "Minimum prototype commitment is $25." };
  }

  const remaining = listing.terms.R - listing.raisedAmount;
  if (amount > remaining) {
    return {
      store,
      error: `Only $${remaining.toLocaleString()} remaining on this raise.`,
    };
  }

  const investment: Investment = {
    id: createId("inv"),
    listingId: listing.id,
    createdAt: nowIso(),
    fanName: input.fanName.trim() || "Fan",
    fanEmail: input.fanEmail.trim(),
    amount,
    fanFraction: fanFraction(amount, listing.terms.R),
    /** Prototype: committed + held in simulated escrow (no card charge) */
    status: "committed",
    custody: "in_escrow",
  };

  const raisedAmount = listing.raisedAmount + amount;
  const funded = raisedAmount >= listing.terms.R;
  const status = funded ? ("funded" as const) : ("live" as const);
  const escrowBalance = listing.escrowBalance + amount;
  const escrowStatus = funded ? ("holding" as const) : ("collecting" as const);

  let escrowEvents = pushEscrowEvent(store.escrowEvents ?? [], {
    listingId: listing.id,
    type: "deposit",
    amount,
    note: `Simulated fan deposit into Muse escrow (${investment.fanEmail}).`,
  });

  if (funded && listing.escrowStatus !== "holding") {
    escrowEvents = pushEscrowEvent(escrowEvents, {
      listingId: listing.id,
      type: "raise_closed",
      amount: escrowBalance,
      note: "Raise target met — funds remain in escrow until release to artist.",
    });
  }

  const listings = store.listings.map((l) =>
    l.id === listing.id
      ? {
          ...l,
          raisedAmount,
          status,
          escrowBalance,
          escrowStatus,
          raiseClosedAt: funded ? l.raiseClosedAt || nowIso() : l.raiseClosedAt,
          updatedAt: nowIso(),
        }
      : l
  );

  return {
    investment,
    store: {
      ...store,
      listings,
      investments: [investment, ...store.investments],
      escrowEvents,
      currentFanEmail: investment.fanEmail,
    },
  };
}

/** Close an open raise early (or confirm funded) — funds stay in escrow. */
export function closeRaise(
  store: MuseStore,
  listingId: string
): { store: MuseStore; listing?: Listing; error?: string } {
  const listing = store.listings.find((l) => l.id === listingId);
  if (!listing) return { store, error: "Listing not found." };
  if (listing.escrowStatus === "released" || listing.escrowStatus === "refunded") {
    return { store, error: "Escrow already settled for this listing." };
  }
  if (listing.escrowBalance <= 0) {
    return { store, error: "No funds in escrow to close against." };
  }
  if (listing.escrowStatus === "holding") {
    return { store, listing };
  }

  const next: Listing = {
    ...listing,
    status: "funded",
    escrowStatus: "holding",
    raiseClosedAt: listing.raiseClosedAt || nowIso(),
    updatedAt: nowIso(),
  };

  return {
    listing: next,
    store: {
      ...store,
      listings: store.listings.map((l) => (l.id === listingId ? next : l)),
      escrowEvents: pushEscrowEvent(store.escrowEvents ?? [], {
        listingId,
        type: "raise_closed",
        amount: next.escrowBalance,
        note: "Raise closed — simulated funds remain segregated in platform escrow.",
      }),
    },
  };
}

/**
 * Release net raise to artist after platform fee.
 * Muse never treats escrow as operating cash — fee is recorded separately.
 */
export function releaseEscrowToArtist(
  store: MuseStore,
  listingId: string
): { store: MuseStore; listing?: Listing; error?: string } {
  const listing = store.listings.find((l) => l.id === listingId);
  if (!listing) return { store, error: "Listing not found." };
  if (listing.escrowStatus === "released") {
    return { store, error: "Escrow already released to artist." };
  }
  if (listing.escrowBalance <= 0) {
    return { store, error: "Nothing in escrow to release." };
  }

  const gross = listing.escrowBalance;
  const fee = Math.round(gross * POLICY.raiseFeeRate * 100) / 100;
  const net = Math.round((gross - fee) * 100) / 100;

  const next: Listing = {
    ...listing,
    status: listing.status === "live" ? "funded" : listing.status,
    escrowStatus: "released",
    escrowBalance: 0,
    artistReleasedAmount: listing.artistReleasedAmount + net,
    platformFeeCollected: listing.platformFeeCollected + fee,
    raiseClosedAt: listing.raiseClosedAt || nowIso(),
    escrowReleasedAt: nowIso(),
    updatedAt: nowIso(),
  };

  const investments = store.investments.map((inv) =>
    inv.listingId === listingId && inv.custody === "in_escrow"
      ? { ...inv, custody: "released_to_artist" as const }
      : inv
  );

  let escrowEvents = pushEscrowEvent(store.escrowEvents ?? [], {
    listingId,
    type: "platform_fee",
    amount: fee,
    note: `Simulated Muse raise fee (${(POLICY.raiseFeeRate * 100).toFixed(0)}%). Not operating cash from fan principal beyond fee.`,
  });
  escrowEvents = pushEscrowEvent(escrowEvents, {
    listingId,
    type: "release_to_artist",
    amount: net,
    note: `Simulated disbursement of net raise to artist (${listing.profile.stageName}).`,
  });

  return {
    listing: next,
    store: {
      ...store,
      listings: store.listings.map((l) => (l.id === listingId ? next : l)),
      investments,
      escrowEvents,
    },
  };
}

export function approveListing(
  store: MuseStore,
  listingId: string
): { store: MuseStore; listing?: Listing; error?: string } {
  const listing = store.listings.find((l) => l.id === listingId);
  if (!listing) return { store, error: "Listing not found." };
  if (listing.status !== "pending_review" && listing.status !== "draft") {
    return { store, error: "Only pending/draft listings can be approved." };
  }
  const next: Listing = {
    ...listing,
    status: "live",
    autoApproved: false,
    updatedAt: nowIso(),
  };
  return {
    listing: next,
    store: {
      ...store,
      listings: store.listings.map((l) => (l.id === listingId ? next : l)),
    },
  };
}

export function rejectListing(
  store: MuseStore,
  listingId: string,
  reason = ""
): { store: MuseStore; listing?: Listing; error?: string } {
  const listing = store.listings.find((l) => l.id === listingId);
  if (!listing) return { store, error: "Listing not found." };
  const next: Listing = {
    ...listing,
    status: "closed",
    updatedAt: nowIso(),
    pricing: {
      ...listing.pricing,
      notes: [
        ...listing.pricing.notes,
        reason
          ? `Rejected (prototype): ${reason}`
          : "Rejected in prototype admin review.",
      ],
    },
  };
  return {
    listing: next,
    store: {
      ...store,
      listings: store.listings.map((l) => (l.id === listingId ? next : l)),
    },
  };
}

/** Simulate one revenue period → fan pool split. No money moves. */
export function simulatePayout(
  store: MuseStore,
  input: {
    listingId: string;
    definedNet: number;
    periodLabel?: string;
  }
): { store: MuseStore; payout?: PayoutCycle; error?: string } {
  const listing = store.listings.find((l) => l.id === input.listingId);
  if (!listing) return { store, error: "Listing not found." };
  if (listing.status !== "live" && listing.status !== "funded") {
    return { store, error: "Listing must be live or funded to report revenue." };
  }

  const definedNet = Number(input.definedNet);
  if (!Number.isFinite(definedNet) || definedNet < 0) {
    return { store, error: "Defined net must be a non-negative number." };
  }

  const poolAmount = listing.terms.S * definedNet;
  const investments = store.investments.filter(
    (i) => i.listingId === listing.id
  );

  const distributions = investments.map((inv) => ({
    investmentId: inv.id,
    fanEmail: inv.fanEmail,
    fanName: inv.fanName,
    amount: inv.fanFraction * poolAmount,
  }));

  const payout: PayoutCycle = {
    id: createId("payout"),
    listingId: listing.id,
    createdAt: nowIso(),
    periodLabel: input.periodLabel?.trim() || `Period ${nowIso().slice(0, 7)}`,
    definedNet,
    poolAmount,
    distributions,
    note: "PROTOTYPE simulation only — no bank transfer or escrow release.",
  };

  const payouts = store.payouts ?? [];

  return {
    payout,
    store: {
      ...store,
      payouts: [payout, ...payouts],
    },
  };
}
