/**
 * Database facade — local JSON by default, Supabase when env is configured.
 * Prototype only.
 */

import type { PublishArtistInput } from "../domain";
import {
  getBackendMode,
  hostedNeedsSupabase,
  isHostedDeploy,
} from "../supabase/client";
import * as local from "./db-local";
import * as remote from "./db-supabase";

const HOSTED_SETUP_ERROR =
  "This experimental deploy needs Supabase for shared persistence. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in the host env (see docs/DEPLOY_EXPERIMENTAL.md).";

export function getPrototypeMeta() {
  const mode = getBackendMode();
  const needsSetup = hostedNeedsSupabase();
  return {
    prototype: true as const,
    experimental: true as const,
    mode: mode === "supabase" ? "supabase" : "local-json-file",
    persistence:
      mode === "supabase"
        ? "supabase postgres + storage"
        : isHostedDeploy()
          ? "unavailable-on-serverless (configure Supabase)"
          : ".data/muse.json",
    payments: false,
    auth: false,
    escrow: "simulated" as const,
    legalOffering: false,
    hosted: isHostedDeploy(),
    needsSupabaseSetup: needsSetup,
    message: needsSetup
      ? HOSTED_SETUP_ERROR
      : "Muse experimental prototype — simulated escrow only. No real money, accounts, or securities offering.",
  };
}

function blockIfNeedsSetup():
  | { blocked: true; error: string }
  | { blocked: false } {
  if (hostedNeedsSupabase()) {
    return { blocked: true, error: HOSTED_SETUP_ERROR };
  }
  return { blocked: false };
}

export async function resetDb() {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) {
    throw new Error(gate.error);
  }
  if (getBackendMode() === "supabase") return remote.sbResetDb();
  return local.resetDb();
}

export async function dbListLive() {
  if (hostedNeedsSupabase()) return [];
  if (getBackendMode() === "supabase") return remote.sbListLive();
  return local.dbListLive();
}

export async function dbListPending() {
  if (hostedNeedsSupabase()) return [];
  if (getBackendMode() === "supabase") return remote.sbListPending();
  return local.dbListPending();
}

export async function dbGetListing(id: string) {
  if (hostedNeedsSupabase()) return undefined;
  if (getBackendMode() === "supabase") return remote.sbGetListing(id);
  return local.dbGetListing(id);
}

export async function dbGetInvestments(listingId?: string, email?: string) {
  if (hostedNeedsSupabase()) return [];
  if (getBackendMode() === "supabase") {
    return remote.sbGetInvestments(listingId, email);
  }
  return local.dbGetInvestments(listingId, email);
}

export async function dbGetPayouts(listingId?: string) {
  if (hostedNeedsSupabase()) return [];
  if (getBackendMode() === "supabase") return remote.sbGetPayouts(listingId);
  return local.dbGetPayouts(listingId);
}

export async function dbPublish(input: PublishArtistInput) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbPublish(input);
  return local.dbPublish(input);
}

export async function dbInvest(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbInvest(input);
  return local.dbInvest(input);
}

export async function dbApprove(listingId: string) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbApprove(listingId);
  return local.dbApprove(listingId);
}

export async function dbReject(listingId: string, reason?: string) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbReject(listingId, reason);
  return local.dbReject(listingId, reason);
}

export async function dbSimulatePayout(input: {
  listingId: string;
  definedNet: number;
  periodLabel?: string;
}) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbSimulatePayout(input);
  return local.dbSimulatePayout(input);
}

export async function dbCloseRaise(listingId: string) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbCloseRaise(listingId);
  return local.dbCloseRaise(listingId);
}

export async function dbReleaseEscrow(listingId: string) {
  const gate = blockIfNeedsSetup();
  if (gate.blocked) return { store: local.readDb(), error: gate.error };
  if (getBackendMode() === "supabase") return remote.sbReleaseEscrow(listingId);
  return local.dbReleaseEscrow(listingId);
}

export async function dbGetEscrowEvents(listingId?: string) {
  if (hostedNeedsSupabase()) return [];
  if (getBackendMode() === "supabase") {
    return remote.sbGetEscrowEvents(listingId);
  }
  return local.dbGetEscrowEvents(listingId);
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
