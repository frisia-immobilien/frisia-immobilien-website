import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function insidePublicRoot() {
  return path.join(process.cwd(), "..", "inside", "public");
}

export async function GET(request: NextRequest) {
  const imagePath = request.nextUrl.searchParams.get("path") || "";
  if (!imagePath.startsWith("/uploads/partners/") || imagePath.includes("..")) {
    return NextResponse.json({ ok: false, error: "Ungueltiger Bildpfad." }, { status: 400 });
  }

  const extension = path.extname(imagePath).toLocaleLowerCase("de-DE");
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return NextResponse.json({ ok: false, error: "Bildformat nicht erlaubt." }, { status: 415 });
  }

  const absolutePath = path.join(insidePublicRoot(), imagePath);
  try {
    const file = await fs.readFile(absolutePath);
    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bild nicht gefunden." }, { status: 404 });
  }
}
