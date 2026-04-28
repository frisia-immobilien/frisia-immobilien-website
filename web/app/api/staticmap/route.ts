import { NextResponse } from "next/server";

export const runtime = "nodejs";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fallbackMap(lat: number, lon: number, w: number, h: number) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Kartenansicht">
  <rect width="100%" height="100%" fill="#eaf0f8"/>
  <path d="M0 ${h * 0.18} C ${w * 0.22} ${h * 0.05}, ${w * 0.38} ${h * 0.35}, ${w} ${h * 0.16}" fill="none" stroke="#ffffff" stroke-width="18" opacity="0.95"/>
  <path d="M0 ${h * 0.72} C ${w * 0.26} ${h * 0.55}, ${w * 0.54} ${h * 0.86}, ${w} ${h * 0.68}" fill="none" stroke="#ffffff" stroke-width="16" opacity="0.95"/>
  <path d="M${w * 0.12} 0 L${w * 0.72} ${h}" stroke="#c9d4df" stroke-width="7"/>
  <path d="M${w * 0.82} 0 L${w * 0.22} ${h}" stroke="#c9d4df" stroke-width="6"/>
  <path d="M0 ${h * 0.43} L${w} ${h * 0.52}" stroke="#d8e0e8" stroke-width="8"/>
  <path d="M0 ${h * 0.36} L${w} ${h * 0.29}" stroke="#d8e0e8" stroke-width="5"/>
  <circle cx="${w * 0.5}" cy="${h * 0.5}" r="18" fill="#1b3040"/>
  <circle cx="${w * 0.5}" cy="${h * 0.5}" r="7" fill="#c9a15d"/>
  <rect x="${w * 0.04}" y="${h - 54}" width="240" height="34" rx="4" fill="#ffffff" opacity="0.92"/>
  <text x="${w * 0.04 + 16}" y="${h - 32}" font-family="Arial, sans-serif" font-size="14" fill="#1b3040">Regionale Lageansicht (${lat.toFixed(4)}, ${lon.toFixed(4)})</text>
</svg>`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
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

  let upstream: Response;
  try {
    upstream = await fetch(u.toString(), {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "FrisiaImmobilien/1.0 (+https://frisia-immobilien.de)",
        Accept: "image/png,image/*;q=0.9,*/*;q=0.1",
      },
    });
  } catch {
    return fallbackMap(lat, lon, w, h);
  }

  if (!upstream.ok) {
    return fallbackMap(lat, lon, w, h);
  }

  const contentType = upstream.headers.get("content-type") || "image/png";

  // Manche Upstreams liefern HTML trotz 200 → abfangen
  if (!contentType.startsWith("image/")) {
    return fallbackMap(lat, lon, w, h);
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
