import { NextResponse } from "next/server";
import { dbListLive, getPrototypeMeta, resetDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const listings = await dbListLive();
  return NextResponse.json({
    ...getPrototypeMeta(),
    listings,
  });
}

export async function DELETE() {
  try {
    const store = await resetDb();
    return NextResponse.json({
      ...getPrototypeMeta(),
      ok: true,
      listings: store.listings.filter(
        (l) => l.status === "live" || l.status === "funded"
      ),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ...getPrototypeMeta(),
        ok: false,
        error: e instanceof Error ? e.message : "Reset failed",
      },
      { status: 503 }
    );
  }
}
