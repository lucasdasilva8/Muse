/**
 * Document upload facade — local disk or Supabase Storage.
 * Prototype stub: files are stored but not OCR'd or auto-verified.
 */

import { createId, nowIso } from "../format";
import { getBackendMode } from "../supabase/client";
import type { ArtistDocument, DocumentCategory } from "../types";
import * as remote from "./db-supabase";
import {
  getLocalDocument,
  listLocalDocuments,
  readLocalDocumentFile,
  saveLocalDocument,
  verifyLocalDocument,
} from "./documents-local";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB prototype limit

export async function listDocumentsForListing(
  listingId?: string
): Promise<ArtistDocument[]> {
  if (getBackendMode() === "supabase") {
    return remote.sbListDocuments(listingId);
  }
  return listLocalDocuments(listingId);
}

export async function uploadDocument(input: {
  listingId: string;
  artistId: string;
  filename: string;
  mimeType: string;
  category: DocumentCategory;
  buffer: Buffer;
}): Promise<ArtistDocument> {
  if (input.buffer.length > MAX_BYTES) {
    throw new Error("File too large (prototype max 8MB).");
  }
  if (input.buffer.length === 0) {
    throw new Error("Empty file.");
  }

  if (getBackendMode() === "supabase") {
    const id = createId("doc");
    const safeName = input.filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120);
    const storagePath = `${input.listingId}/${id}-${safeName}`;
    await remote.sbUploadFile(storagePath, input.buffer, input.mimeType);
    const doc: ArtistDocument = {
      id,
      listingId: input.listingId,
      artistId: input.artistId,
      createdAt: nowIso(),
      filename: input.filename,
      mimeType: input.mimeType || "application/octet-stream",
      sizeBytes: input.buffer.length,
      category: input.category,
      storagePath,
      verified: false,
      backend: "supabase",
    };
    return remote.sbSaveDocument(doc);
  }

  return saveLocalDocument(input);
}

export async function verifyDocument(id: string, verified: boolean) {
  if (getBackendMode() === "supabase") {
    return remote.sbVerifyDocument(id, verified);
  }
  return verifyLocalDocument(id, verified);
}

export async function getDocumentFile(
  id: string
): Promise<{ doc: ArtistDocument; buffer: Buffer } | null> {
  if (getBackendMode() === "supabase") {
    const docs = await remote.sbListDocuments();
    const doc = docs.find((d) => d.id === id);
    if (!doc) return null;
    const { data, error } = await (
      await import("../supabase/client")
    )
      .getSupabaseAdmin()!
      .storage.from("muse-docs")
      .download(doc.storagePath);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());
    return { doc, buffer };
  }

  const doc = getLocalDocument(id);
  if (!doc) return null;
  const buffer = readLocalDocumentFile(doc);
  if (!buffer) return null;
  return { doc, buffer };
}
