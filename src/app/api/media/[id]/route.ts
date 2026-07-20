import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMongo } from "@/lib/mongodb";

/** Serves admin-uploaded project images out of MongoDB with long caching.
 *  Media documents are immutable (delete + re-upload to change), so
 *  aggressive caching is safe. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mongo = getMongo();
  if (!mongo || !ObjectId.isValid(id)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const doc = await (await mongo)
      .db("elhegazi")
      .collection("media")
      .findOne({ _id: new ObjectId(id) });
    const dataUrl: string | undefined = doc?.dataUrl;
    if (!dataUrl) return new NextResponse(null, { status: 404 });

    const comma = dataUrl.indexOf(",");
    const meta = dataUrl.slice(5, comma); // e.g. "image/jpeg;base64"
    const type = meta.split(";")[0] || "image/jpeg";
    const buf = Buffer.from(dataUrl.slice(comma + 1), "base64");

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
