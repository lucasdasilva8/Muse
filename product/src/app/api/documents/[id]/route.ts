import { NextResponse } from "next/server";
import { getDocumentFile } from "@/lib/server/documents";
import { getPrototypeMeta } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = await getDocumentFile(id);
  if (!result) {
    return NextResponse.json(
      { ...getPrototypeMeta(), error: "File not found" },
      { status: 404 }
    );
  }
  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.doc.mimeType,
      "Content-Disposition": `inline; filename="${result.doc.filename.replace(/"/g, "")}"`,
      "X-Muse-Prototype": "true",
    },
  });
}
