"use client";

import { computePricing, fanFraction, POLICY } from "./pricing";
import { createId, nowIso } from "./format";
import { emptyStore } from "./seed";
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

const KEY = "muse.store.v1";

type Listener = () => void;

let memory: MuseStore | null = null;
const listeners = new Set<Listener>();

function canUseDom() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): MuseStore {
  if (memory) return memory;
  if (!canUseDom()) {
    memory = emptyStore();
    return memory;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      memory = emptyStore();
      localStorage.setItem(KEY, JSON.stringify(memory));
      return memory;
    }
    memory = JSON.parse(raw) as MuseStore;
    return memory;
  } catch {
    memory = emptyStore();
    return memory;
  }
}

function write(next: MuseStore) {
  memory = next;
  if (canUseDom()) {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStore(): MuseStore {
  return read();
}

export function resetStore(): MuseStore {
  const next = emptyStore();
  write(next);
  return next;
}

export function listLiveListings(): Listing[] {
  return read().listings.filter((l) => l.status === "live" || l.status === "funded");
}

export function getListing(id: string): Listing | undefined {
  return read().listings.find((l) => l.id === id);
}

export function getInvestmentsForListing(listingId: string): Investment[] {
  return read().investments.filter((i) => i.listingId === listingId);
}

export function getInvestmentsForFan(email: string): Investment[] {
  const e = email.trim().toLowerCase();
  return read().investments.filter((i) => i.fanEmail.toLowerCase() === e);
}

export function getListingsForArtist(artistId: string): Listing[] {
  return read().listings.filter((l) => l.artistId === artistId);
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
  /** If coherent, auto-go live in backbone; else pending_review */
  forceLive?: boolean;
}

export function publishArtistListing(input: PublishArtistInput): {
  listing?: Listing;
  error?: string;
} {
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
    return { error: "Stage name and email are required." };
  }
  if (revenue.vann <= 0) {
    return { error: "Annual defined net (V_ann) must be greater than zero." };
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

  const store = read();
  write({
    ...store,
    listings: [listing, ...store.listings],
    currentArtistId: profile.id,
  });

  return { listing };
}

export function investInListing(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}): { investment?: Investment; error?: string } {
  const store = read();
  const listing = store.listings.find((l) => l.id === input.listingId);
  if (!listing) return { error: "Listing not found." };
  if (listing.status !== "live") return { error: "Listing is not open for investment." };

  const amount = Number(input.amount);
  if (!input.fanEmail.trim()) return { error: "Email is required." };
  if (!Number.isFinite(amount) || amount < 25) {
    return { error: "Minimum interest is $25." };
  }

  const remaining = listing.terms.R - listing.raisedAmount;
  if (amount > remaining) {
    return { error: `Only $${remaining.toLocaleString()} remaining on this raise.` };
  }

  const investment: Investment = {
    id: createId("inv"),
    listingId: listing.id,
    createdAt: nowIso(),
    fanName: input.fanName.trim() || "Fan",
    fanEmail: input.fanEmail.trim(),
    amount,
    fanFraction: fanFraction(amount, listing.terms.R),
    status: "committed",
  };

  const raisedAmount = listing.raisedAmount + amount;
  const status = raisedAmount >= listing.terms.R ? ("funded" as const) : ("live" as const);

  const listings = store.listings.map((l) =>
    l.id === listing.id
      ? { ...l, raisedAmount, status, updatedAt: nowIso() }
      : l
  );

  write({
    ...store,
    listings,
    investments: [investment, ...store.investments],
    currentFanEmail: investment.fanEmail,
  });

  return { investment };
}

export function setCurrentArtist(artistId: string | null) {
  const store = read();
  write({ ...store, currentArtistId: artistId });
}

export { POLICY };
