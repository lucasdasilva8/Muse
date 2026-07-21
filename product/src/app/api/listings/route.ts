import { NextResponse } from "next/server";
import { dbListLive, getPrototypeMeta, resetDb } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...getPrototypeMeta(),
    listings: dbListLive(),
  });
}

/** Reset prototype data to Mira Vale sample — demo only */
export async function DELETE() {
  const store = resetDb();
  return NextResponse.json({
    ...getPrototypeMeta(),
    ok: true,
    listings: store.listings.filter(
      (l) => l.status === "live" || l.status === "funded"
    ),
  });
}
