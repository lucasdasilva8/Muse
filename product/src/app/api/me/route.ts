import { NextResponse } from "next/server";
import {
  dbArtistListings,
  dbGetInvestments,
  dbSnapshot,
  getPrototypeMeta,
} from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || undefined;
  const artistId = searchParams.get("artistId");

  if (email) {
    return NextResponse.json({
      ...getPrototypeMeta(),
      investments: dbGetInvestments(undefined, email),
    });
  }

  if (artistId !== null) {
    const id = artistId === "" || artistId === "sample" ? null : artistId;
    const listings = dbArtistListings(id);
    const listing = listings[0];
    return NextResponse.json({
      ...getPrototypeMeta(),
      currentArtistId: dbSnapshot().currentArtistId,
      listings,
      investments: listing ? dbGetInvestments(listing.id) : [],
    });
  }

  return NextResponse.json({
    ...getPrototypeMeta(),
    store: dbSnapshot(),
  });
}
