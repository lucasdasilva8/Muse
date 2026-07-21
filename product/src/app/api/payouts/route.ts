import { NextResponse } from "next/server";
import { dbGetPayouts, dbSimulatePayout, getPrototypeMeta } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const listingId = new URL(req.url).searchParams.get("listingId") || undefined;
  return NextResponse.json({
    ...getPrototypeMeta(),
    payouts: dbGetPayouts(listingId || undefined),
  });
}

export async function POST(req: Request) {
  let body: {
    listingId?: string;
    definedNet?: number;
    periodLabel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const result = dbSimulatePayout({
    listingId: String(body.listingId || ""),
    definedNet: Number(body.definedNet),
    periodLabel: body.periodLabel,
  });

  if (result.error || !result.payout) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: result.error || "Could not simulate payout" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ...getPrototypeMeta(),
    payout: result.payout,
    notice:
      "Prototype revenue report only — no funds were moved to fans or artists.",
  });
}
