"use client";

import type { ArtistDocument, Investment, Listing, PayoutCycle } from "./types";
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

export async function apiAdminPending() {
  const res = await fetch("/api/admin", { cache: "no-store" });
  return parse<{ pending: Listing[] }>(res);
}

export async function apiAdminAction(
  listingId: string,
  action: "approve" | "reject",
  reason?: string
) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, action, reason }),
  });
  return parse<{ listing: Listing; pending: Listing[] }>(res);
}

export async function apiSimulatePayout(input: {
  listingId: string;
  definedNet: number;
  periodLabel?: string;
}) {
  const res = await fetch("/api/payouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ payout: PayoutCycle }>(res);
}

export async function apiListPayouts(listingId?: string) {
  const q = listingId ? `?listingId=${encodeURIComponent(listingId)}` : "";
  const res = await fetch(`/api/payouts${q}`, { cache: "no-store" });
  return parse<{ payouts: PayoutCycle[] }>(res);
}

export async function apiGetSession() {
  const res = await fetch("/api/session", { cache: "no-store" });
  return parse<{
    session: { artistId: string | null; fanEmail: string | null };
  }>(res);
}

export async function apiSetSession(body: {
  role: "artist" | "fan" | "clear";
  email?: string;
  artistId?: string;
}) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<{
    session: { artistId: string | null; fanEmail: string | null };
  }>(res);
}

export async function apiListDocuments(listingId?: string) {
  const q = listingId ? `?listingId=${encodeURIComponent(listingId)}` : "";
  const res = await fetch(`/api/documents${q}`, { cache: "no-store" });
  return parse<{ documents: ArtistDocument[] }>(res);
}

export async function apiUploadDocument(input: {
  listingId: string;
  category: string;
  file: File;
}) {
  const form = new FormData();
  form.set("listingId", input.listingId);
  form.set("category", input.category);
  form.set("file", input.file);
  const res = await fetch("/api/documents", { method: "POST", body: form });
  return parse<{ document: ArtistDocument }>(res);
}

export async function apiVerifyDocument(id: string, verified: boolean) {
  const res = await fetch("/api/documents", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, verified }),
  });
  return parse<{ document: ArtistDocument }>(res);
}
