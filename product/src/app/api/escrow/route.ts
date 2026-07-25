import { NextRequest, NextResponse } from "next/server";
import {
  dbCloseRaise,
  dbGetEscrowEvents,
  dbReleaseEscrow,
  getPrototypeMeta,
} from "@/lib/server/db";

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listingId") || undefined;
  const events = await dbGetEscrowEvents(listingId);
  return NextResponse.json({
    ...getPrototypeMeta(),
    events,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    listingId?: string;
    action?: "close_raise" | "release_to_artist";
  };

  if (!body.listingId) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "listingId is required" },
      { status: 400 }
    );
  }

  if (body.action === "close_raise") {
    const result = await dbCloseRaise(body.listingId);
    if (result.error) {
      return NextResponse.json(
        { ...getPrototypeMeta(), error: result.error },
        { status: 400 }
      );
    }
    const events = await dbGetEscrowEvents(body.listingId);
    return NextResponse.json({
      ...getPrototypeMeta(),
      listing: result.listing,
      events,
      notice:
        "Raise closed (sim). Funds remain in Muse escrow until release to artist.",
    });
  }

  if (body.action === "release_to_artist") {
    const result = await dbReleaseEscrow(body.listingId);
    if (result.error) {
      return NextResponse.json(
        { ...getPrototypeMeta(), error: result.error },
        { status: 400 }
      );
    }
    const events = await dbGetEscrowEvents(body.listingId);
    return NextResponse.json({
      ...getPrototypeMeta(),
      listing: result.listing,
      events,
      notice:
        "Escrow release simulated — net raise marked disbursed to artist; fee recorded separately. No bank transfer.",
    });
  }

  return NextResponse.json(
    {
      ...getPrototypeMeta(),
      error: "action must be close_raise or release_to_artist",
    },
    { status: 400 }
  );
}
