import { NextResponse } from "next/server";
import { dbGetInvestments, dbGetListing, getPrototypeMeta } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const listing = dbGetListing(id);
  if (!listing) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Listing not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    ...getPrototypeMeta(),
    listing,
    investments: dbGetInvestments(id),
  });
}
