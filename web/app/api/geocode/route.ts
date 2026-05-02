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

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    country?: string;
    countrycode?: string;
    type?: string;
  };
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

type SearchVariant = {
  mode: "query" | "structured";
  q?: string;
  street?: string;
  houseNumber?: string;
  requestedHouseNumber?: string;
  postalCode?: string;
  city?: string;
};

const GEOCODE_CACHE_TTL_MS = 5 * 60 * 1000;
const geocodeCache = new Map<string, { expiresAt: number; results: Array<GeocodeResult & { score: number }> }>();

function norm(v: unknown) {
  return String(v ?? "").trim();
}

function compactHouseNumber(value: unknown) {
  return norm(value).replace(/\s+/g, "").toLowerCase();
}

function houseNumberBase(value: unknown) {
  return compactHouseNumber(value).match(/^\d+/)?.[0] ?? "";
}

function splitHouseNumberSuffix(value: unknown) {
  const raw = norm(value);
  const match = raw.match(/^(\d+)\s*([a-zA-ZäöüÄÖÜß])$/);
  if (!match) return null;
  return { base: match[1], suffix: match[2] };
}

function houseNumberSearchVariants(value: unknown) {
  const raw = norm(value);
  if (!raw) return [] as string[];

  const split = splitHouseNumberSuffix(raw);
  if (!split) return [raw];

  return Array.from(
    new Set([
      raw,
      `${split.base}${split.suffix}`,
      `${split.base} ${split.suffix}`,
      `${split.base}${split.suffix.toUpperCase()}`,
      split.base,
    ].filter(Boolean)),
  );
}

function splitQueryAddress(value: string) {
  const q = norm(value);
  const match = q.match(/^(.+?)\s+(\d+\s*[a-zA-ZäöüÄÖÜß])$/);
  if (!match) return null;
  return {
    street: norm(match[1]),
    houseNumber: norm(match[2]),
  };
}

function truncatedQueryVariants(value: string) {
  const q = norm(value);
  if (q.length < 7) return [] as string[];

  return Array.from(
    new Set(
      [q.slice(0, -1), q.slice(0, -2)]
        .map((candidate) => candidate.trim())
        .filter((candidate) => candidate.length >= 5),
    ),
  );
}

function buildSearchVariants(input: {
  q: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}) {
  const explicitStreet = norm(input.street);
  const explicitHouseNumber = norm(input.houseNumber);
  const parsed = explicitStreet
    ? { street: explicitStreet, houseNumber: explicitHouseNumber }
    : splitQueryAddress(input.q);

  const split = splitHouseNumberSuffix(parsed?.houseNumber);
  if (!parsed?.street || !parsed.houseNumber || !split) {
    const baseQuery = parsed?.street ? `${parsed.street} ${parsed.houseNumber}`.trim() : input.q;
    const looseQueries = [baseQuery, ...truncatedQueryVariants(baseQuery)];
    return looseQueries.flatMap((query) => [
      {
        mode: "query",
        q: query,
        postalCode: input.postalCode,
        city: input.city,
      } satisfies SearchVariant,
      {
        mode: "query",
        q: query,
        postalCode: "",
        city: input.city,
      } satisfies SearchVariant,
      {
        mode: "query",
        q: query,
        postalCode: input.postalCode,
        city: "",
      } satisfies SearchVariant,
      {
        mode: "query",
        q: query,
        postalCode: "",
        city: "",
      } satisfies SearchVariant,
    ]);
  }

  const variants = houseNumberSearchVariants(parsed.houseNumber);
  const requestedHouseNumber = parsed.houseNumber;
  return variants.flatMap((houseNumber) => [
    {
      mode: "structured" as const,
      street: parsed.street,
      houseNumber,
      requestedHouseNumber,
    },
    {
      mode: "query" as const,
      q: `${parsed.street} ${houseNumber}`,
      requestedHouseNumber,
    },
  ]);
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

function scoreResult(result: GeocodeResult, requestedHouseNumber?: string) {
  const requested = compactHouseNumber(requestedHouseNumber);
  const resultHouseNumber = compactHouseNumber(result.houseNumber);

  if (!requested) return 0;
  if (resultHouseNumber && resultHouseNumber === requested) return 100;
  if (resultHouseNumber && houseNumberBase(resultHouseNumber) === houseNumberBase(requested)) return 80;
  if (result.houseNumber) return 45;
  if (result.street) return 25;
  return 0;
}

function resultKey(result: GeocodeResult) {
  return [
    result.street.toLowerCase(),
    compactHouseNumber(result.houseNumber),
    result.postalCode,
    result.city?.toLowerCase(),
    result.lat.toFixed(6),
    result.lon.toFixed(6),
  ].join("|");
}

function cachedResults(key: string) {
  const cached = geocodeCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    geocodeCache.delete(key);
    return null;
  }
  return cached.results;
}

function setCachedResults(key: string, results: Array<GeocodeResult & { score: number }>) {
  geocodeCache.set(key, {
    expiresAt: Date.now() + GEOCODE_CACHE_TTL_MS,
    results,
  });
}

async function fetchPhotonAutocomplete(input: {
  q: string;
  postalCode: string;
  city: string;
  limit: string;
}) {
  const query = [input.q, input.city].filter(Boolean).join(" ");
  const cacheKey = `photon:${query}|${input.postalCode}|${input.limit}`;
  const cached = cachedResults(cacheKey);
  if (cached) return cached;

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("lang", "de");
  url.searchParams.set("limit", input.limit);
  url.searchParams.set("lat", "53.47");
  url.searchParams.set("lon", "7.48");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "frisia-immobilien.de (immobilienbewertung geocode)",
    },
    cache: "no-store",
  });

  if (!response.ok) return [] as Array<GeocodeResult & { score: number }>;

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const requestedPostalCode = norm(input.postalCode);
  const requestedCity = norm(input.city).toLowerCase();

  const results = (Array.isArray(data.features) ? data.features : [])
    .map((feature): GeocodeResult & { score: number } | null => {
      const properties = feature.properties ?? {};
      const coordinates = feature.geometry?.coordinates;
      const lon = Number(coordinates?.[0]);
      const lat = Number(coordinates?.[1]);
      const street = norm(properties.name || properties.street);
      if (!street || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

      const houseNumber = norm(properties.housenumber);
      const postalCode = norm(properties.postcode);
      const city = norm(properties.city);
      const district = norm(properties.district);
      const type = norm(properties.type);
      const cityMatches = requestedCity && city ? city.toLowerCase() === requestedCity : false;
      const postalMatches = requestedPostalCode && postalCode ? postalCode === requestedPostalCode : false;
      const isStreetLike = type === "street" || type === "house" || type === "locality";
      const labelParts = [
        [street, houseNumber].filter(Boolean).join(" ").trim(),
        [postalCode, city].filter(Boolean).join(" ").trim(),
      ].filter(Boolean);

      return {
        label: labelParts.join(", "),
        street,
        houseNumber: houseNumber || undefined,
        postalCode: postalCode || undefined,
        city: city || undefined,
        district: district || undefined,
        lat,
        lon,
        score: (isStreetLike ? 50 : 0) + (cityMatches ? 30 : 0) + (postalMatches ? 20 : 0),
      };
    })
    .filter((result): result is GeocodeResult & { score: number } => result !== null)
    .sort((a, b) => b.score - a.score);

  setCachedResults(cacheKey, results);
  return results;
}

async function fetchNominatimVariant(input: {
  variant: SearchVariant;
  postalCode: string;
  city: string;
  limit: string;
}) {
  const postalCode = input.variant.postalCode ?? input.postalCode;
  const city = input.variant.city ?? input.city;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", input.limit);
  url.searchParams.set("countrycodes", "de");

  if (input.variant.mode === "structured" && input.variant.street) {
    url.searchParams.set(
      "street",
      [input.variant.houseNumber, input.variant.street].filter(Boolean).join(" "),
    );
    if (postalCode) url.searchParams.set("postalcode", postalCode);
    if (city) url.searchParams.set("city", city);
    url.searchParams.set("country", "Deutschland");
  } else {
    const queryParts = [input.variant.q, postalCode, city].filter(Boolean).join(", ");
    url.searchParams.set("q", queryParts);
  }

  const cacheKey = `nominatim:${url.searchParams.toString()}`;
  const cached = cachedResults(cacheKey);
  if (cached) return cached;

  const r = await fetch(url.toString(), {
    headers: {
      "User-Agent": "frisia-immobilien.de (immobilienbewertung geocode)",
      "Accept-Language": "de",
    },
    cache: "no-store",
  });

  if (!r.ok) return [] as Array<GeocodeResult & { score: number }>;

  const data = (await r.json()) as unknown;

  const results = (Array.isArray(data) ? data : [])
    .map((it): GeocodeResult & { score: number } => {
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
        score: scoreResult(
          {
            label: labelParts.join(", "),
            street: street || "",
            houseNumber: houseNumber || undefined,
            postalCode: pc || undefined,
            city: c || undefined,
            district: d || undefined,
            lat,
            lon,
          },
          input.variant.requestedHouseNumber,
        ),
      };
    })
    .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon));

  setCachedResults(cacheKey, results);
  return results;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = norm(searchParams.get("q"));
  const street = norm(searchParams.get("street"));
  const houseNumber = norm(searchParams.get("houseNumber"));
  const postalCode = norm(searchParams.get("postalCode"));
  const city = norm(searchParams.get("city"));
  const limit = norm(searchParams.get("limit") || "6");

  if (!q && !street) {
    return NextResponse.json({ results: [] });
  }

  const variants = buildSearchVariants({ q, street, houseNumber, postalCode, city });
  const seen = new Set<string>();
  const collected: Array<GeocodeResult & { score: number }> = [];
  const maxResults = Math.max(1, Math.min(10, Number(limit) || 6));
  const parsedQueryAddress = splitQueryAddress(q);
  const requestedHouseNumber = houseNumber || parsedQueryAddress?.houseNumber || "";
  const requestedStreet = street || parsedQueryAddress?.street || "";
  const hasCompleteAddress = Boolean(requestedStreet && requestedHouseNumber);
  const isStreetAutocomplete = !street && !houseNumber && !parsedQueryAddress;

  if (isStreetAutocomplete || hasCompleteAddress) {
    const photonQuery = hasCompleteAddress ? [requestedStreet, requestedHouseNumber].filter(Boolean).join(" ") : q;
    const photonResults = await fetchPhotonAutocomplete({ q: photonQuery, postalCode, city, limit });
    for (const result of photonResults) {
      const key = resultKey(result);
      if (seen.has(key)) continue;
      seen.add(key);
      collected.push(result);
      if (collected.length >= maxResults) break;
    }
  }

  if (collected.length === 0 && !isStreetAutocomplete) {
    for (const variant of variants) {
      try {
        const results = await fetchNominatimVariant({ variant, postalCode, city, limit });
        for (const result of results) {
          const key = resultKey(result);
          if (seen.has(key)) continue;
          seen.add(key);
          collected.push(result);
        }
        if (collected.length >= maxResults) break;
      } catch {
        // Einzelne Fallback-Varianten dürfen scheitern; die restlichen werden weiter versucht.
      }
    }
  }

  const results = collected
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((result) => ({
      label: result.label,
      street: result.street,
      houseNumber: result.houseNumber,
      postalCode: result.postalCode,
      city: result.city,
      district: result.district,
      lat: result.lat,
      lon: result.lon,
    }));

  return NextResponse.json({ results });
}
