import { NextResponse } from "next/server";
import { dbGetListing, getPrototypeMeta } from "@/lib/server/db";
import {
  listDocumentsForListing,
  uploadDocument,
  verifyDocument,
} from "@/lib/server/documents";
import type { DocumentCategory } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const listingId =
    new URL(req.url).searchParams.get("listingId") || undefined;
  return NextResponse.json({
    ...getPrototypeMeta(),
    documents: await listDocumentsForListing(listingId),
    notice:
      "Prototype document stubs — uploads are stored but not auto-verified.",
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const listingId = String(form.get("listingId") || "");
    const category = String(
      form.get("category") || "other"
    ) as DocumentCategory;
    const file = form.get("file");

    if (!listingId || !(file instanceof File)) {
      return NextResponse.json(
        {
          ...getPrototypeMeta(),
          error: "listingId and file are required",
        },
        { status: 400 }
      );
    }

    const listing = await dbGetListing(listingId);
    if (!listing) {
      return NextResponse.json(
        { ...getPrototypeMeta(), error: "Listing not found" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await uploadDocument({
      listingId,
      artistId: listing.artistId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      category,
      buffer,
    });

    return NextResponse.json({
      ...getPrototypeMeta(),
      document: doc,
      notice:
        "Prototype upload saved. Marked unverified — admin can toggle verification later.",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ...getPrototypeMeta(),
        error: e instanceof Error ? e.message : "Upload failed",
      },
      { status: 400 }
    );
  }
}

/** PATCH body: { id, verified } — prototype admin verify toggle */
export async function PATCH(req: Request) {
  let body: { id?: string; verified?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const id = String(body.id || "");
  if (!id || typeof body.verified !== "boolean") {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "id and verified boolean required" },
      { status: 400 }
    );
  }
  const doc = await verifyDocument(id, body.verified);
  if (!doc) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Document not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ...getPrototypeMeta(),
    document: doc,
    notice: "Prototype verification flag only — not a legal audit.",
  });
}
