import { NextResponse } from "next/server";
import {
  dbApprove,
  dbListPending,
  dbReject,
  getPrototypeMeta,
} from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...getPrototypeMeta(),
    pending: dbListPending(),
    notice: "Prototype admin queue — no real compliance review.",
  });
}

export async function POST(req: Request) {
  let body: { listingId?: string; action?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const listingId = String(body.listingId || "");
  const action = String(body.action || "");

  if (!listingId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      {
        ...getPrototypeMeta(),
        error: "Provide listingId and action: approve | reject",
      },
      { status: 400 }
    );
  }

  const result =
    action === "approve"
      ? dbApprove(listingId)
      : dbReject(listingId, body.reason);

  if (result.error || !result.listing) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: result.error || "Action failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ...getPrototypeMeta(),
    listing: result.listing,
    pending: dbListPending(),
    notice: `Prototype ${action} only — not a legal listing decision.`,
  });
}
