/**
 * Supabase-backed prototype store.
 * Used when NEXT_PUBLIC_SUPABASE_URL (+ key) are set.
 * Still prototype — no auth RLS locked down for production.
 */

import {
  approveListing,
  closeRaise,
  investInListing,
  normalizeInvestment,
  normalizeListing,
  publishArtistListing,
  rejectListing,
  releaseEscrowToArtist,
  simulatePayout,
  type PublishArtistInput,
} from "../domain";
import { emptyStore } from "../seed";
import { getSupabaseAdmin } from "../supabase/client";
import type {
  ArtistDocument,
  ArtistProfile,
  EscrowEvent,
  EscrowStatus,
  Investment,
  Listing,
  MuseStore,
  OfferStatus,
  PayoutCycle,
  PricingSnapshot,
  RevenueInputs,
  TractionInputs,
} from "../types";

type ListingRow = {
  id: string;
  artist_id: string;
  created_at: string;
  updated_at: string;
  status: OfferStatus;
  raise_amount: number;
  share_pct: number;
  term_months: number;
  cap_multiple: number;
  traction: TractionInputs;
  revenue: RevenueInputs;
  pricing: PricingSnapshot;
  raised_amount: number;
  auto_approved: boolean;
  profile: ArtistProfile;
  escrow_status?: EscrowStatus;
  escrow_balance?: number;
  artist_released_amount?: number;
  platform_fee_collected?: number;
  raise_closed_at?: string | null;
  escrow_released_at?: string | null;
};

function sb() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

function rowToListing(row: ListingRow): Listing {
  return normalizeListing({
    id: row.id,
    artistId: row.artist_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    profile: row.profile,
    traction: row.traction,
    revenue: row.revenue,
    terms: {
      R: Number(row.raise_amount),
      S: Number(row.share_pct),
      T: Number(row.term_months),
      C: Number(row.cap_multiple),
    },
    pricing: row.pricing,
    raisedAmount: Number(row.raised_amount),
    autoApproved: row.auto_approved,
    escrowStatus: row.escrow_status ?? "collecting",
    escrowBalance:
      row.escrow_balance !== undefined
        ? Number(row.escrow_balance)
        : Number(row.raised_amount),
    artistReleasedAmount: Number(row.artist_released_amount) || 0,
    platformFeeCollected: Number(row.platform_fee_collected) || 0,
    raiseClosedAt: row.raise_closed_at || undefined,
    escrowReleasedAt: row.escrow_released_at || undefined,
  });
}

function listingToRow(listing: Listing) {
  return {
    id: listing.id,
    artist_id: listing.artistId,
    created_at: listing.createdAt,
    updated_at: listing.updatedAt,
    status: listing.status,
    raise_amount: listing.terms.R,
    share_pct: listing.terms.S,
    term_months: listing.terms.T,
    cap_multiple: listing.terms.C,
    traction: listing.traction,
    revenue: listing.revenue,
    pricing: listing.pricing,
    raised_amount: listing.raisedAmount,
    auto_approved: listing.autoApproved,
    profile: listing.profile,
    escrow_status: listing.escrowStatus,
    escrow_balance: listing.escrowBalance,
    artist_released_amount: listing.artistReleasedAmount,
    platform_fee_collected: listing.platformFeeCollected,
    raise_closed_at: listing.raiseClosedAt ?? null,
    escrow_released_at: listing.escrowReleasedAt ?? null,
    prototype: true,
  };
}

async function loadAllListings(): Promise<Listing[]> {
  const { data, error } = await sb().from("listings").select("*");
  if (error) throw new Error(error.message);
  return (data as ListingRow[]).map(rowToListing);
}

async function loadInvestments(): Promise<Investment[]> {
  const { data, error } = await sb().from("investments").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map((row) =>
    normalizeInvestment({
      id: row.id as string,
      listingId: row.listing_id as string,
      createdAt: row.created_at as string,
      fanName: (row.fan_name as string) || "Fan",
      fanEmail: row.fan_email as string,
      amount: Number(row.amount),
      fanFraction: Number(row.fan_fraction),
      status: row.status as Investment["status"],
      custody: (row.custody as Investment["custody"]) || "in_escrow",
    })
  );
}

async function loadPayouts(): Promise<PayoutCycle[]> {
  const { data, error } = await sb().from("payouts").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    createdAt: row.created_at as string,
    periodLabel: row.period_label as string,
    definedNet: Number(row.defined_net),
    poolAmount: Number(row.pool_amount),
    distributions: (row.distributions || []) as PayoutCycle["distributions"],
    note: (row.note as string) || "",
  }));
}

async function loadDocuments(): Promise<ArtistDocument[]> {
  const { data, error } = await sb().from("documents").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    artistId: row.artist_id as string,
    createdAt: row.created_at as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    sizeBytes: Number(row.size_bytes),
    category: row.category as ArtistDocument["category"],
    storagePath: row.storage_path as string,
    verified: Boolean(row.verified),
    backend: "supabase" as const,
  }));
}

async function loadEscrowEvents(): Promise<EscrowEvent[]> {
  const { data, error } = await sb().from("escrow_events").select("*");
  if (error) {
    // Table may not exist yet on older prototypes
    if (error.message.toLowerCase().includes("escrow_events")) return [];
    throw new Error(error.message);
  }
  return (data || []).map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    createdAt: row.created_at as string,
    type: row.type as EscrowEvent["type"],
    amount: Number(row.amount),
    note: (row.note as string) || "",
  }));
}

async function snapshot(): Promise<MuseStore> {
  const [listings, investments, payouts, documents, escrowEvents] =
    await Promise.all([
      loadAllListings(),
      loadInvestments(),
      loadPayouts(),
      loadDocuments(),
      loadEscrowEvents(),
    ]);
  return {
    version: 1,
    listings,
    investments,
    payouts,
    documents,
    escrowEvents,
    currentArtistId: null,
    currentFanEmail: null,
  };
}

async function upsertListing(listing: Listing) {
  // Ensure artist row exists
  await sb()
    .from("artists")
    .upsert({
      id: listing.profile.id,
      created_at: listing.profile.createdAt,
      stage_name: listing.profile.stageName,
      legal_name: listing.profile.legalName,
      email: listing.profile.email,
      genre: listing.profile.genre,
      location: listing.profile.location,
      bio: listing.profile.bio,
      links: listing.profile.links,
      raise_purpose: listing.profile.raisePurpose,
    });

  const { error } = await sb().from("listings").upsert(listingToRow(listing));
  if (error) throw new Error(error.message);
}

async function upsertInvestment(inv: Investment) {
  const { error } = await sb().from("investments").upsert({
    id: inv.id,
    listing_id: inv.listingId,
    created_at: inv.createdAt,
    fan_name: inv.fanName,
    fan_email: inv.fanEmail,
    amount: inv.amount,
    fan_fraction: inv.fanFraction,
    status: inv.status,
    custody: inv.custody,
    payment_processed: false,
  });
  if (error) throw new Error(error.message);
}

async function upsertEscrowEvents(events: EscrowEvent[], listingId: string) {
  const rows = events
    .filter((e) => e.listingId === listingId)
    .map((e) => ({
      id: e.id,
      listing_id: e.listingId,
      created_at: e.createdAt,
      type: e.type,
      amount: e.amount,
      note: e.note,
    }));
  if (!rows.length) return;
  const { error } = await sb().from("escrow_events").upsert(rows);
  if (error && !error.message.toLowerCase().includes("escrow_events")) {
    throw new Error(error.message);
  }
}

async function upsertPayout(p: PayoutCycle) {
  const { error } = await sb().from("payouts").upsert({
    id: p.id,
    listing_id: p.listingId,
    created_at: p.createdAt,
    period_label: p.periodLabel,
    defined_net: p.definedNet,
    pool_amount: p.poolAmount,
    distributions: p.distributions,
    note: p.note,
  });
  if (error) throw new Error(error.message);
}

export async function sbResetDb(): Promise<MuseStore> {
  // Soft reset: wipe tables and reseed Mira Vale via domain empty store
  const client = sb();
  await client.from("escrow_events").delete().neq("id", "");
  await client.from("documents").delete().neq("id", "");
  await client.from("payouts").delete().neq("id", "");
  await client.from("investments").delete().neq("id", "");
  await client.from("listings").delete().neq("id", "");
  await client.from("artists").delete().neq("id", "");

  const seed = emptyStore();
  for (const listing of seed.listings) {
    await upsertListing(listing);
  }
  for (const inv of seed.investments) {
    await upsertInvestment(inv);
  }
  await upsertEscrowEvents(seed.escrowEvents, "listing_mira_vale");
  return seed;
}

export async function sbListLive() {
  const all = await loadAllListings();
  return all.filter((l) => l.status === "live" || l.status === "funded");
}

export async function sbListPending() {
  const all = await loadAllListings();
  return all.filter((l) => l.status === "pending_review");
}

export async function sbGetListing(id: string) {
  const { data, error } = await sb()
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToListing(data as ListingRow) : undefined;
}

export async function sbGetInvestments(listingId?: string, email?: string) {
  let q = sb().from("investments").select("*");
  if (listingId) q = q.eq("listing_id", listingId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = (data || []).map((row) =>
    normalizeInvestment({
      id: row.id as string,
      listingId: row.listing_id as string,
      createdAt: row.created_at as string,
      fanName: (row.fan_name as string) || "Fan",
      fanEmail: row.fan_email as string,
      amount: Number(row.amount),
      fanFraction: Number(row.fan_fraction),
      status: row.status as Investment["status"],
      custody: (row.custody as Investment["custody"]) || "in_escrow",
    })
  );
  if (email) {
    const e = email.trim().toLowerCase();
    rows = rows.filter((i) => i.fanEmail.toLowerCase() === e);
  }
  return rows;
}

export async function sbGetPayouts(listingId?: string) {
  let q = sb().from("payouts").select("*");
  if (listingId) q = q.eq("listing_id", listingId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    createdAt: row.created_at as string,
    periodLabel: row.period_label as string,
    definedNet: Number(row.defined_net),
    poolAmount: Number(row.pool_amount),
    distributions: (row.distributions || []) as PayoutCycle["distributions"],
    note: (row.note as string) || "",
  }));
}

export async function sbPublish(input: PublishArtistInput) {
  const store = await snapshot();
  const result = publishArtistListing(store, input);
  if (result.error || !result.listing) return result;
  await upsertListing(result.listing);
  return result;
}

export async function sbInvest(input: {
  listingId: string;
  fanName: string;
  fanEmail: string;
  amount: number;
}) {
  const store = await snapshot();
  const result = investInListing(store, input);
  if (result.error || !result.investment) return result;
  const listing = result.store.listings.find((l) => l.id === input.listingId);
  if (listing) await upsertListing(listing);
  await upsertInvestment(result.investment);
  await upsertEscrowEvents(result.store.escrowEvents, input.listingId);
  return result;
}

export async function sbCloseRaise(listingId: string) {
  const store = await snapshot();
  const result = closeRaise(store, listingId);
  if (result.error || !result.listing) return result;
  await upsertListing(result.listing);
  await upsertEscrowEvents(result.store.escrowEvents, listingId);
  return result;
}

export async function sbReleaseEscrow(listingId: string) {
  const store = await snapshot();
  const result = releaseEscrowToArtist(store, listingId);
  if (result.error || !result.listing) return result;
  await upsertListing(result.listing);
  for (const inv of result.store.investments.filter(
    (i) => i.listingId === listingId
  )) {
    await upsertInvestment(inv);
  }
  await upsertEscrowEvents(result.store.escrowEvents, listingId);
  return result;
}

export async function sbGetEscrowEvents(listingId?: string) {
  const rows = await loadEscrowEvents();
  if (!listingId) return rows;
  return rows.filter((e) => e.listingId === listingId);
}

export async function sbApprove(listingId: string) {
  const store = await snapshot();
  const result = approveListing(store, listingId);
  if (result.error || !result.listing) return result;
  await upsertListing(result.listing);
  return result;
}

export async function sbReject(listingId: string, reason?: string) {
  const store = await snapshot();
  const result = rejectListing(store, listingId, reason);
  if (result.error || !result.listing) return result;
  await upsertListing(result.listing);
  return result;
}

export async function sbSimulatePayout(input: {
  listingId: string;
  definedNet: number;
  periodLabel?: string;
}) {
  const store = await snapshot();
  const result = simulatePayout(store, input);
  if (result.error || !result.payout) return result;
  await upsertPayout(result.payout);
  return result;
}

export async function sbArtistListings(artistId: string | null) {
  const all = await loadAllListings();
  if (artistId) return all.filter((l) => l.artistId === artistId);
  return all.filter((l) => l.id === "listing_mira_vale");
}

export async function sbSnapshot() {
  return snapshot();
}

export async function sbSaveDocument(doc: ArtistDocument) {
  const { error } = await sb().from("documents").upsert({
    id: doc.id,
    listing_id: doc.listingId,
    artist_id: doc.artistId,
    created_at: doc.createdAt,
    filename: doc.filename,
    mime_type: doc.mimeType,
    size_bytes: doc.sizeBytes,
    category: doc.category,
    storage_path: doc.storagePath,
    verified: doc.verified,
    prototype: true,
  });
  if (error) throw new Error(error.message);
  return doc;
}

export async function sbListDocuments(listingId?: string) {
  let q = sb().from("documents").select("*");
  if (listingId) q = q.eq("listing_id", listingId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    id: row.id as string,
    listingId: row.listing_id as string,
    artistId: row.artist_id as string,
    createdAt: row.created_at as string,
    filename: row.filename as string,
    mimeType: row.mime_type as string,
    sizeBytes: Number(row.size_bytes),
    category: row.category as ArtistDocument["category"],
    storagePath: row.storage_path as string,
    verified: Boolean(row.verified),
    backend: "supabase" as const,
  }));
}

export async function sbUploadFile(
  storagePath: string,
  buffer: Buffer,
  mimeType: string
) {
  const { error } = await sb()
    .storage.from("muse-docs")
    .upload(storagePath, buffer, { contentType: mimeType, upsert: true });
  if (error) throw new Error(error.message);
}

export async function sbVerifyDocument(id: string, verified: boolean) {
  const { data, error } = await sb()
    .from("documents")
    .update({ verified })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return {
    id: data.id as string,
    listingId: data.listing_id as string,
    artistId: data.artist_id as string,
    createdAt: data.created_at as string,
    filename: data.filename as string,
    mimeType: data.mime_type as string,
    sizeBytes: Number(data.size_bytes),
    category: data.category as ArtistDocument["category"],
    storagePath: data.storage_path as string,
    verified: Boolean(data.verified),
    backend: "supabase" as const,
  };
}
