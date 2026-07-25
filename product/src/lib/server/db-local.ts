/**
 * Local JSON prototype database (.data/muse.json)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  approveListing,
  closeRaise,
  investInListing,
  normalizeStore,
  publishArtistListing,
  rejectListing,
  releaseEscrowToArtist,
  simulatePayout,
  type PublishArtistInput,
} from "../domain";
import { emptyStore } from "../seed";
import type { EscrowEvent, MuseStore } from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "muse.json");

const globalForMuse = globalThis as unknown as {
  __museStore?: MuseStore;
};

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb(): MuseStore {
  if (globalForMuse.__museStore) {
    return normalizeStore(globalForMuse.__museStore);
  }

  ensureDir();
  if (!existsSync(DATA_FILE)) {
    const seed = emptyStore();
    writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
    globalForMuse.__museStore = seed;
    return seed;
  }

  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    const parsed = normalizeStore(JSON.parse(raw) as MuseStore);
    globalForMuse.__museStore = parsed;
    return parsed;
  } catch {
    const seed = emptyStore();
    globalForMuse.__museStore = seed;
    return seed;
  }
}

export function writeDb(store: MuseStore): MuseStore {
  ensureDir();
  const next = normalizeStore(store);
  globalForMuse.__museStore = next;
  writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function resetDb(): MuseStore {
  return writeDb(emptyStore());
}

export function dbListLive() {
  return readDb().listings.filter(
    (l) => l.status === "live" || l.status === "funded"
  );
}

export function dbListPending() {
  return readDb().listings.filter((l) => l.status === "pending_review");
}

export function dbGetListing(id: string) {
  return readDb().listings.find((l) => l.id === id);
}

export function dbGetInvestments(listingId?: string, email?: string) {
  const store = readDb();
  let rows = store.investments;
  if (listingId) rows = rows.filter((i) => i.listingId === listingId);
  if (email) {
    const e = email.trim().toLowerCase();
    rows = rows.filter((i) => i.fanEmail.toLowerCase() === e);
  }
  return rows;
}

export function dbGetPayouts(listingId?: string) {
  const rows = readDb().payouts ?? [];
  if (!listingId) return rows;
  return rows.filter((p) => p.listingId === listingId);
}

export function dbPublish(input: PublishArtistInput) {
  const result = publishArtistListing(readDb(), input);
  if (result.listing) writeDb(result.store);
  return result;
}

export function dbInvest(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}) {
  const result = investInListing(readDb(), input);
  if (result.investment) writeDb(result.store);
  return result;
}

export function dbApprove(listingId: string) {
  const result = approveListing(readDb(), listingId);
  if (result.listing) writeDb(result.store);
  return result;
}

export function dbReject(listingId: string, reason?: string) {
  const result = rejectListing(readDb(), listingId, reason);
  if (result.listing) writeDb(result.store);
  return result;
}

export function dbSimulatePayout(input: {
  listingId: string;
  definedNet: number;
  periodLabel?: string;
}) {
  const result = simulatePayout(readDb(), input);
  if (result.payout) writeDb(result.store);
  return result;
}

export function dbCloseRaise(listingId: string) {
  const result = closeRaise(readDb(), listingId);
  if (result.listing && !result.error) writeDb(result.store);
  return result;
}

export function dbReleaseEscrow(listingId: string) {
  const result = releaseEscrowToArtist(readDb(), listingId);
  if (result.listing && !result.error) writeDb(result.store);
  return result;
}

export function dbGetEscrowEvents(listingId?: string): EscrowEvent[] {
  const rows = readDb().escrowEvents ?? [];
  if (!listingId) return rows;
  return rows.filter((e) => e.listingId === listingId);
}

export function dbArtistListings(artistId: string | null) {
  const store = readDb();
  if (artistId) {
    return store.listings.filter((l) => l.artistId === artistId);
  }
  return store.listings.filter((l) => l.id === "listing_mira_vale");
}

export function dbSetCurrentArtist(artistId: string | null) {
  const store = readDb();
  return writeDb({ ...store, currentArtistId: artistId });
}

export function dbSetCurrentFan(email: string | null) {
  const store = readDb();
  return writeDb({ ...store, currentFanEmail: email });
}

export function dbSnapshot() {
  return readDb();
}
