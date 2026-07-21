import { NextResponse } from "next/server";
import { dbPublish, getPrototypeMeta } from "@/lib/server/db";
import type { PublishArtistInput } from "@/lib/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: PublishArtistInput;
  try {
    body = (await req.json()) as PublishArtistInput;
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const result = dbPublish(body);
  if (result.error || !result.listing) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: result.error || "Could not publish" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ...getPrototypeMeta(),
    listing: result.listing,
    notice:
      "Prototype publish only — listing is simulated in local JSON, not a real fundraising round.",
  });
}
