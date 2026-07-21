"use client";

import type { Investment, Listing } from "./types";
import type { PublishArtistInput } from "./domain";

export type PrototypeMeta = {
  prototype: true;
  mode: string;
  persistence: string;
  payments: boolean;
  auth: boolean;
  escrow: boolean;
  legalOffering: boolean;
  message: string;
  notice?: string;
  error?: string;
};

async function parse<T>(res: Response): Promise<T & PrototypeMeta> {
  const data = (await res.json()) as T & PrototypeMeta;
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function apiListListings() {
  const res = await fetch("/api/listings", { cache: "no-store" });
  return parse<{ listings: Listing[] }>(res);
}

export async function apiGetListing(id: string) {
  const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
  return parse<{ listing: Listing; investments: Investment[] }>(res);
}

export async function apiPublishListing(input: PublishArtistInput) {
  const res = await fetch("/api/listings/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ listing: Listing }>(res);
}

export async function apiInvest(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}) {
  const res = await fetch("/api/invest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ investment: Investment }>(res);
}

export async function apiPortfolio(email: string) {
  const res = await fetch(`/api/me?email=${encodeURIComponent(email)}`, {
    cache: "no-store",
  });
  return parse<{ investments: Investment[] }>(res);
}

export async function apiArtistDashboard(artistId?: string | null) {
  const q =
    artistId === undefined
      ? "artistId=sample"
      : `artistId=${encodeURIComponent(artistId || "sample")}`;
  const res = await fetch(`/api/me?${q}`, { cache: "no-store" });
  return parse<{
    currentArtistId: string | null;
    listings: Listing[];
    investments: Investment[];
  }>(res);
}

export async function apiResetPrototype() {
  const res = await fetch("/api/listings", { method: "DELETE" });
  return parse<{ ok: boolean; listings: Listing[] }>(res);
}
