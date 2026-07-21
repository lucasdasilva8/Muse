/**
 * Pure domain mutations — used by the prototype server DB.
 * Not a production ledger. No payments, no auth, no escrow.
 */

import { computePricing, fanFraction } from "./pricing";
import { createId, nowIso } from "./format";
import type {
  ArtistProfile,
  IncomeCategory,
  Investment,
  Listing,
  MuseStore,
  OfferTerms,
  RevenueInputs,
  TractionInputs,
  VerificationLevel,
} from "./types";

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
    /** Prototype: marked committed, but no payment was taken */
    status: "committed",
  };

  const raisedAmount = listing.raisedAmount + amount;
  const status = raisedAmount >= listing.terms.R ? ("funded" as const) : ("live" as const);

  const listings = store.listings.map((l) =>
    l.id === listing.id
      ? { ...l, raisedAmount, status, updatedAt: nowIso() }
      : l
  );

  return {
    investment,
    store: {
      ...store,
      listings,
      investments: [investment, ...store.investments],
      currentFanEmail: investment.fanEmail,
    },
  };
}
