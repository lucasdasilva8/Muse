/**
 * Prototype server database.
 * Persists to product/.data/muse.json for local demos.
 * NOT durable production storage. NOT wired to real Supabase unless you add keys later.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { emptyStore } from "../seed";
import type { MuseStore } from "../types";
import {
  investInListing,
  publishArtistListing,
  type PublishArtistInput,
} from "../domain";

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
    return globalForMuse.__museStore;
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
    const parsed = JSON.parse(raw) as MuseStore;
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
  globalForMuse.__museStore = store;
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  return store;
}

export function resetDb(): MuseStore {
  return writeDb(emptyStore());
}

export function getPrototypeMeta() {
  return {
    prototype: true as const,
    mode: "local-json-file",
    persistence: ".data/muse.json",
    payments: false,
    auth: false,
    escrow: false,
    legalOffering: false,
    message:
      "Muse prototype API — simulated commitments only. No real money, accounts, or securities offering.",
  };
}

export function dbListLive() {
  return readDb().listings.filter(
    (l) => l.status === "live" || l.status === "funded"
  );
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

export function dbArtistListings(artistId: string | null) {
  const store = readDb();
  if (artistId) {
    return store.listings.filter((l) => l.artistId === artistId);
  }
  return store.listings.filter((l) => l.id === "listing_mira_vale");
}

export function dbSnapshot() {
  return readDb();
}
