"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getStore, subscribe } from "./store";
import type { Investment, Listing, MuseStore } from "./types";

function getSnapshot(): MuseStore {
  return getStore();
}

function getServerSnapshot(): MuseStore {
  return {
    version: 1,
    listings: [],
    investments: [],
    currentArtistId: null,
    currentFanEmail: null,
  };
}

export function useMuseStore(): MuseStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useLiveListings(): Listing[] {
  const store = useMuseStore();
  return store.listings.filter((l) => l.status === "live" || l.status === "funded");
}

export function useListing(id: string): Listing | undefined {
  const store = useMuseStore();
  return store.listings.find((l) => l.id === id);
}

export function useListingInvestments(listingId: string): Investment[] {
  const store = useMuseStore();
  return store.investments.filter((i) => i.listingId === listingId);
}

/** Avoid hydration mismatch for client-only store */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
