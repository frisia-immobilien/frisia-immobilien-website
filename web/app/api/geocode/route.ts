import { NextResponse } from "next/server";

type GeoAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  locality?: string;
  suburb?: string;
  city_district?: string;
  district?: string;
  borough?: string;
  quarter?: string;
  neighbourhood?: string;
  residential?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  path?: string;
  cycleway?: string;
  house_number?: string;
  postcode?: string;
};

type NominatimItem = {
  lat?: string;
  lon?: string;
  address?: GeoAddress;
};

type GeocodeResult = {
  label: string;
  street: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  district?: string;
  lat: number;
  lon: number;
};

function norm(v: unknown) {
  return String(v ?? "").trim();
}

function pickCity(a: GeoAddress | undefined) {
  return norm(
    a?.city ||
      a?.town ||
      a?.village ||
      a?.municipality ||
      a?.hamlet ||
      a?.locality ||
      ""
  );
}

function pickDistrict(a: GeoAddress | undefined) {
  return norm(
    a?.suburb ||
      a?.city_district ||
      a?.district ||
      a?.borough ||
      a?.quarter ||
      a?.neighbourhood ||
      a?.residential ||
      a?.hamlet ||
      ""
  );
}

function pickStreet(a: GeoAddress | undefined) {
  return norm(
    a?.road ||
      a?.pedestrian ||
      a?.footway ||
      a?.path ||
      a?.cycleway ||
      ""
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = norm(searchParams.get("q"));
  const postalCode = norm(searchParams.get("postalCode"));
  const city = norm(searchParams.get("city"));
  const limit = norm(searchParams.get("limit") || "6");

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const queryParts = [q, postalCode, city].filter(Boolean).join(", ");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", limit);
  url.searchParams.set("q", queryParts);

  const r = await fetch(url.toString(), {
    headers: {
      "User-Agent": "frisia-immobilien.de (immobilienbewertung geocode)",
      "Accept-Language": "de",
    },
    cache: "no-store",
  });

  if (!r.ok) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const data = (await r.json()) as unknown;

  const results = (Array.isArray(data) ? data : [])
    .map((it): GeocodeResult => {
      const item = it as NominatimItem;
      const a = item.address;

      const street = pickStreet(a);
      const houseNumber = norm(a?.house_number || "");
      const pc = norm(a?.postcode || "");
      const c = pickCity(a);
      const d = pickDistrict(a);

      const lat = Number(item.lat);
      const lon = Number(item.lon);

      // ✅ Label = nur Adresse + PLZ/Ort (OHNE Ortsteil)
      const labelParts = [
        [street, houseNumber].filter(Boolean).join(" ").trim(),
        [pc, c].filter(Boolean).join(" ").trim(),
      ].filter(Boolean);

      return {
        label: labelParts.join(", "),
        street: street || "",
        houseNumber: houseNumber || undefined,
        postalCode: pc || undefined,
        city: c || undefined,
        district: d || undefined, // ✅ separat
        lat,
        lon,
      };
    })
    .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon));

  return NextResponse.json({ results });
}
