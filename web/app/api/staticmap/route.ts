import { NextResponse } from "next/server";

export const runtime = "nodejs";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  // Zoom sauber begrenzen
  const zoom = clamp(Number(searchParams.get("zoom") ?? 15), 3, 18);

  // Breite/Höhe begrenzen
  const w = clamp(Number(searchParams.get("w") ?? 620), 240, 1024);
  const h = clamp(Number(searchParams.get("h") ?? 350), 200, 1024);

  // Steuerparameter: Regionsansicht ohne Marker
  const noMarker = searchParams.get("nomarker") === "1";

  // Lat/Lon müssen immer gültig sein (auch für Regionskarte)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
  }

  // Upstream-URL zusammenbauen
  const u = new URL("https://staticmap.openstreetmap.de/staticmap.php");
  u.searchParams.set("center", `${lat},${lon}`);
  u.searchParams.set("zoom", String(zoom));
  u.searchParams.set("size", `${w}x${h}`);

  // Marker nur setzen, wenn keine Regionsansicht aktiv ist
  if (!noMarker) {
    // Marker-Syntax mit Icon ist stabiler als nur lat,lon
    u.searchParams.set("markers", `${lat},${lon},red-pushpin`);
  }

  const upstream = await fetch(u.toString(), {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": "FrisiaImmobilien/1.0 (+https://frisia-immobilien.de)",
      Accept: "image/png,image/*;q=0.9,*/*;q=0.1",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "Upstream map failed",
        status: upstream.status,
      },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get("content-type") || "image/png";

  // Manche Upstreams liefern HTML trotz 200 → abfangen
  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      {
        error: "Upstream did not return an image",
        contentType,
      },
      { status: 502 }
    );
  }

  const buf = await upstream.arrayBuffer();

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
