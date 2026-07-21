/**
 * Database facade — local JSON by default, Supabase when env is configured.
 * Prototype only.
 */

import type { PublishArtistInput } from "../domain";
import { getBackendMode } from "../supabase/client";
import * as local from "./db-local";
import * as remote from "./db-supabase";

export function getPrototypeMeta() {
  const mode = getBackendMode();
  return {
    prototype: true as const,
    mode: mode === "supabase" ? "supabase" : "local-json-file",
    persistence:
      mode === "supabase" ? "supabase postgres + storage" : ".data/muse.json",
    payments: false,
    auth: false,
    escrow: false,
    legalOffering: false,
    message:
      "Muse prototype API — simulated only. No real money, accounts, or securities offering.",
  };
}

export async function resetDb() {
  if (getBackendMode() === "supabase") return remote.sbResetDb();
  return local.resetDb();
}

export async function dbListLive() {
  if (getBackendMode() === "supabase") return remote.sbListLive();
  return local.dbListLive();
}

export async function dbListPending() {
  if (getBackendMode() === "supabase") return remote.sbListPending();
  return local.dbListPending();
}

export async function dbGetListing(id: string) {
  if (getBackendMode() === "supabase") return remote.sbGetListing(id);
  return local.dbGetListing(id);
}

export async function dbGetInvestments(listingId?: string, email?: string) {
  if (getBackendMode() === "supabase") {
    return remote.sbGetInvestments(listingId, email);
  }
  return local.dbGetInvestments(listingId, email);
}

export async function dbGetPayouts(listingId?: string) {
  if (getBackendMode() === "supabase") return remote.sbGetPayouts(listingId);
  return local.dbGetPayouts(listingId);
}

export async function dbPublish(input: PublishArtistInput) {
  if (getBackendMode() === "supabase") return remote.sbPublish(input);
  return local.dbPublish(input);
}

export async function dbInvest(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}) {
  if (getBackendMode() === "supabase") return remote.sbInvest(input);
  return local.dbInvest(input);
}

export async function dbApprove(listingId: string) {
  if (getBackendMode() === "supabase") return remote.sbApprove(listingId);
  return local.dbApprove(listingId);
}

export async function dbReject(listingId: string, reason?: string) {
  if (getBackendMode() === "supabase") return remote.sbReject(listingId, reason);
  return local.dbReject(listingId, reason);
}

export async function dbSimulatePayout(input: {
  listingId: string;
  definedNet: number;
  periodLabel?: string;
}) {
  if (getBackendMode() === "supabase") return remote.sbSimulatePayout(input);
  return local.dbSimulatePayout(input);
}

export async function dbArtistListings(artistId: string | null) {
  if (getBackendMode() === "supabase") return remote.sbArtistListings(artistId);
  return local.dbArtistListings(artistId);
}

export async function dbSetCurrentArtist(artistId: string | null) {
  // Session binding stays local for prototype simplicity
  return local.dbSetCurrentArtist(artistId);
}

export async function dbSetCurrentFan(email: string | null) {
  return local.dbSetCurrentFan(email);
}

export async function dbSnapshot() {
  if (getBackendMode() === "supabase") return remote.sbSnapshot();
  return local.dbSnapshot();
}

// Re-export local read/write for document helpers
export { readDb, writeDb } from "./db-local";
