import { NextResponse } from "next/server";
import { dbInvest, getPrototypeMeta } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: {
    listingId?: string;
    fanName?: string;
    fanEmail?: string;
    amount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const result = dbInvest({
    listingId: String(body.listingId || ""),
    fanName: String(body.fanName || ""),
    fanEmail: String(body.fanEmail || ""),
    amount: Number(body.amount),
  });

  if (result.error || !result.investment) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: result.error || "Could not invest" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ...getPrototypeMeta(),
    investment: result.investment,
    notice:
      "Prototype commitment only — no card was charged, no securities were sold.",
  });
}
