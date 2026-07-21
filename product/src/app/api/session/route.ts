import { NextResponse } from "next/server";
import {
  dbSetCurrentArtist,
  dbSetCurrentFan,
  dbSnapshot,
  getPrototypeMeta,
} from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await dbSnapshot();
  return NextResponse.json({
    ...getPrototypeMeta(),
    session: {
      artistId: store.currentArtistId,
      fanEmail: store.currentFanEmail,
    },
  });
}

export async function POST(req: Request) {
  let body: {
    role?: "artist" | "fan" | "clear";
    email?: string;
    artistId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (body.role === "clear") {
    await dbSetCurrentArtist(null);
    await dbSetCurrentFan(null);
  } else if (body.role === "fan") {
    const email = String(body.email || "").trim();
    if (!email) {
      return NextResponse.json(
        { ...getPrototypeMeta(), error: "Fan email required" },
        { status: 400 }
      );
    }
    await dbSetCurrentFan(email);
  } else if (body.role === "artist") {
    const store = await dbSnapshot();
    const artistId = String(body.artistId || store.currentArtistId || "").trim();
    if (!artistId) {
      return NextResponse.json(
        {
          ...getPrototypeMeta(),
          error: "Publish a listing first, or pass artistId",
        },
        { status: 400 }
      );
    }
    await dbSetCurrentArtist(artistId);
    if (body.email) await dbSetCurrentFan(String(body.email).trim());
  }

  const store = await dbSnapshot();
  return NextResponse.json({
    ...getPrototypeMeta(),
    session: {
      artistId: store.currentArtistId,
      fanEmail: store.currentFanEmail,
    },
    notice: "Prototype session only — not secure login.",
  });
}
