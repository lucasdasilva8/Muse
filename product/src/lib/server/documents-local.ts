/**
 * Local document file storage stub.
 * Files land in product/.data/uploads — not production-secure.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { createId, nowIso } from "../format";
import type { ArtistDocument, DocumentCategory } from "../types";
import { readDb, writeDb } from "./db-local";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

function ensureUploadDir(listingId: string) {
  const dir = path.join(UPLOAD_DIR, listingId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveLocalDocument(input: {
  listingId: string;
  artistId: string;
  filename: string;
  mimeType: string;
  category: DocumentCategory;
  buffer: Buffer;
}): Promise<ArtistDocument> {
  const id = createId("doc");
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const dir = ensureUploadDir(input.listingId);
  const fileName = `${id}-${safeName}`;
  const storagePath = path.join(input.listingId, fileName);
  writeFileSync(path.join(dir, fileName), input.buffer);

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
    backend: "local",
  };

  const store = readDb();
  writeDb({
    ...store,
    documents: [doc, ...(store.documents ?? [])],
  });

  return doc;
}

export function listLocalDocuments(listingId?: string): ArtistDocument[] {
  const docs = readDb().documents ?? [];
  if (!listingId) return docs;
  return docs.filter((d) => d.listingId === listingId);
}

export function getLocalDocument(id: string): ArtistDocument | undefined {
  return (readDb().documents ?? []).find((d) => d.id === id);
}

export function readLocalDocumentFile(doc: ArtistDocument): Buffer | null {
  const full = path.join(UPLOAD_DIR, doc.storagePath);
  if (!existsSync(full)) return null;
  return readFileSync(full);
}

export function verifyLocalDocument(
  id: string,
  verified: boolean
): ArtistDocument | undefined {
  const store = readDb();
  const docs = store.documents ?? [];
  const doc = docs.find((d) => d.id === id);
  if (!doc) return undefined;
  const next = { ...doc, verified };
  writeDb({
    ...store,
    documents: docs.map((d) => (d.id === id ? next : d)),
  });
  return next;
}
