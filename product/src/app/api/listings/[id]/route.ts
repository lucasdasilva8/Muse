import { NextResponse } from "next/server";
import {
  dbGetInvestments,
  dbGetListing,
  getPrototypeMeta,
} from "@/lib/server/db";
import { listDocumentsForListing } from "@/lib/server/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const listing = await dbGetListing(id);
  if (!listing) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Listing not found" },
      { status: 404 }
    );
  }
  const [investments, documents] = await Promise.all([
    dbGetInvestments(id),
    listDocumentsForListing(id),
  ]);
  return NextResponse.json({
    ...getPrototypeMeta(),
    listing,
    investments,
    documents,
  });
}
