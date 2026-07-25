import { computePricing } from "./pricing";
import { createId, nowIso } from "./format";
import type { Listing, MuseStore } from "./types";

export function createMiraValeListing(): Listing {
  const artistId = "artist_mira_vale";
  const profile = {
    id: artistId,
    createdAt: nowIso(),
    stageName: "Mira Vale",
    legalName: "Mira Vale (sample)",
    email: "mira@example.com",
    genre: "Alt-R&B",
    location: "Providence, RI",
    bio: "Raising for a full EP cycle — recording, mixing, and a Northeast release push.",
    links: "spotify.example/mira · ig @miravale",
    raisePurpose: "EP recording + release marketing",
  };

  const traction = {
    monthlyListeners: 52400,
    growthRate6mo: 0.18,
    catalogReleases: 6,
  };

  const revenue = {
    vann: 28000,
    verification: "document_backed" as const,
    categories: ["streaming" as const],
    docsNote: "Sample DistroKid annual statement (prototype)",
  };

  const terms = { R: 8000, S: 0.15, T: 36, C: 1.5 };
  const pricing = computePricing(revenue, traction, terms);
  const raisedAmount = 3200;

  return {
    id: "listing_mira_vale",
    artistId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "live",
    profile,
    traction,
    revenue,
    terms,
    pricing,
    raisedAmount,
    autoApproved: true,
    escrowStatus: "collecting",
    escrowBalance: raisedAmount,
    artistReleasedAmount: 0,
    platformFeeCollected: 0,
  };
}

export function emptyStore(): MuseStore {
  const listing = createMiraValeListing();
  const invAlex = {
    id: createId("inv"),
    listingId: "listing_mira_vale",
    createdAt: nowIso(),
    fanName: "Alex R.",
    fanEmail: "alex@example.com",
    amount: 250,
    fanFraction: 250 / 8000,
    status: "committed" as const,
    custody: "in_escrow" as const,
  };
  const invJordan = {
    id: createId("inv"),
    listingId: "listing_mira_vale",
    createdAt: nowIso(),
    fanName: "Jordan K.",
    fanEmail: "jordan@example.com",
    amount: 100,
    fanFraction: 100 / 8000,
    status: "committed" as const,
    custody: "in_escrow" as const,
  };

  return {
    version: 1,
    listings: [listing],
    investments: [invAlex, invJordan],
    payouts: [],
    documents: [],
    escrowEvents: [
      {
        id: createId("escrow"),
        listingId: listing.id,
        createdAt: nowIso(),
        type: "deposit",
        amount: 250,
        note: "Seed: Alex R. simulated deposit into Muse escrow.",
      },
      {
        id: createId("escrow"),
        listingId: listing.id,
        createdAt: nowIso(),
        type: "deposit",
        amount: 100,
        note: "Seed: Jordan K. simulated deposit into Muse escrow.",
      },
      {
        id: createId("escrow"),
        listingId: listing.id,
        createdAt: nowIso(),
        type: "note",
        amount: listing.escrowBalance,
        note: "Seed raise shows $3,200 raised; remaining seed balance is illustrative escrow float.",
      },
    ],
    currentArtistId: null,
    currentFanEmail: null,
  };
}
