"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiArtistDashboard,
  apiGetListing,
  apiListListings,
  apiPortfolio,
  type PrototypeMeta,
} from "./api";
import type { Investment, Listing } from "./types";

export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useLiveListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<PrototypeMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiListListings();
      setListings(data.listings);
      setMeta(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { listings, meta, loading, error, refresh };
}

export function useListingDetail(id: string) {
  const [listing, setListing] = useState<Listing | undefined>();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [meta, setMeta] = useState<PrototypeMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiGetListing(id);
      setListing(data.listing);
      setInvestments(data.investments);
      setMeta(data);
    } catch (e) {
      setListing(undefined);
      setInvestments([]);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { listing, investments, meta, loading, error, refresh };
}

export function usePortfolio(email: string) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const e = email.trim();
    if (!e) {
      setInvestments([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiPortfolio(e);
      setInvestments(data.investments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { investments, loading, error, refresh };
}

export function useArtistDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentArtistId, setCurrentArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Prefer last published artist from server snapshot
      const data = await apiArtistDashboard(null);
      // If server has currentArtistId, refetch for that artist
      if (data.currentArtistId) {
        const mine = await apiArtistDashboard(data.currentArtistId);
        setListings(mine.listings);
        setInvestments(mine.investments);
        setCurrentArtistId(mine.currentArtistId);
      } else {
        setListings(data.listings);
        setInvestments(data.investments);
        setCurrentArtistId(data.currentArtistId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { listings, investments, currentArtistId, loading, error, refresh };
}
