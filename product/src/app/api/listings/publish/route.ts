import { NextResponse } from "next/server";
import type { PublishArtistInput } from "@/lib/domain";
import { dbPublish, getPrototypeMeta } from "@/lib/server/db";

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

  const result = await dbPublish(body);
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
      "Prototype publish only — not a real fundraising round.",
  });
}
