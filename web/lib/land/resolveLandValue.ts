import "server-only";

import { sql } from "@/lib/db";
import { env } from "@/lib/env";

const DEFAULT_BORIS_API_URL = "https://opendata.lgln.niedersachsen.de/doorman/noauth/boris_wfs";
const NI_BORIS_BBOX = {
  minLng: 6.52640537710648,
  minLat: 51.1973805910083,
  maxLng: 11.7786020870194,
  maxLat: 54.0327816786839,
};
const BB_BORIS_BBOX = {
  minLng: 11.265772516623,
  minLat: 51.3590080790421,
  maxLng: 14.7657478309683,
  maxLat: 53.5590504652457,
};

export type ResolveLandValueInput = {
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
  district?: string | null;
  landkreis?: string | null;
  lat?: number | null;
  lng?: number | null;
  plot_area: number;
  nutzungsart?: string | null;
  erschliessung?: string | null;
};

export type ResolvedLandValue = {
  bodenrichtwert_eur_m2: number;
  calculated_land_value: number;
  boris_zone_id: string | null;
  source: string;
};

type LandValueCacheRow = {
  bodenrichtwert_eur_m2: number | null;
  calculated_land_value: number | null;
  boris_zone_id: string | null;
  source: string | null;
};

type BorisFeature = {
  id?: string;
  geometry?: GeoJsonGeometry | null;
  properties?: Record<string, unknown> | null;
};

type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] }
  | { type: string; coordinates?: unknown };

type BorisFeatureCollection = {
  features?: BorisFeature[];
  numberReturned?: number;
};

type ParsedBorisValue = {
  bodenrichtwert_eur_m2: number;
  boris_zone_id: string | null;
  stichtag: string | null;
  nutzungsart: string | null;
  entwicklungszustand: string | null;
  erschliessung: string | null;
  raw: unknown;
};

type ParsedLglnFeature = ParsedBorisValue & {
  ring: number[][] | null;
};

function isLglnBorisWfsUrl(url: string) {
  return /opendata\.lgln\.niedersachsen\.de\/doorman\/noauth\/boris/i.test(url);
}

function isBrandenburgBorisUrl(url: string) {
  return /ogc-api\.geobasis-bb\.de\/boris/i.test(url);
}

function isWithinNiedersachsenBorisCoverage(input: ResolveLandValueInput) {
  if (input.lat == null || input.lng == null) return false;
  return (
    input.lng >= NI_BORIS_BBOX.minLng &&
    input.lng <= NI_BORIS_BBOX.maxLng &&
    input.lat >= NI_BORIS_BBOX.minLat &&
    input.lat <= NI_BORIS_BBOX.maxLat
  );
}

function isWithinBrandenburgBorisCoverage(input: ResolveLandValueInput) {
  if (input.lat == null || input.lng == null) return false;
  return (
    input.lng >= BB_BORIS_BBOX.minLng &&
    input.lng <= BB_BORIS_BBOX.maxLng &&
    input.lat >= BB_BORIS_BBOX.minLat &&
    input.lat <= BB_BORIS_BBOX.maxLat
  );
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function getNestedText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }

  if (!value || typeof value !== "object") return null;

  const object = value as Record<string, unknown>;
  for (const key of ["bezeichnung", "art", "name", "value", "wert"]) {
    const text = getNestedText(object[key]);
    if (text) return text;
  }

  return null;
}

function getProperty(properties: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (properties[key] !== undefined && properties[key] !== null) return properties[key];
  }
  return null;
}

function extractBorisValue(properties: Record<string, unknown>) {
  const direct = normalizeNumber(properties.bodenrichtwert);
  if (direct && direct > 0) return direct;

  for (const [key, value] of Object.entries(properties)) {
    if (!/bodenrichtwert|richtwert|brw/i.test(key)) continue;
    const number = normalizeNumber(value);
    if (number && number > 0) return number;
  }

  return null;
}

function normalizeDate(value: string | null) {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const german = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (german) return `${german[3]}-${german[2]}-${german[1]}`;
  return null;
}

function extractBorisFeatureData(feature: BorisFeature) {
  const properties = feature.properties ?? {};
  const value = extractBorisValue(properties);
  if (!value) return null;

  const borisZoneId =
    getNestedText(getProperty(properties, ["bodenrichtwertNummer", "boris_zone_id", "zone_id", "id"])) ??
    feature.id ??
    null;
  const stichtag = normalizeDate(getNestedText(getProperty(properties, ["stichtag", "wertermittlungsstichtag"])));
  const nutzungsart =
    getNestedText(getProperty(properties, ["nutzung", "nutzungsart", "artDerNutzung"])) ??
    getNestedText(properties["nutzung.art"]);
  const entwicklungszustand = getNestedText(properties.entwicklungszustand);
  const erschliessung = getNestedText(
    getProperty(properties, ["beitragsrechtlicherZustand", "erschliessung", "erschließung"]),
  );

  return {
    bodenrichtwert_eur_m2: value,
    boris_zone_id: borisZoneId,
    stichtag,
    nutzungsart,
    entwicklungszustand,
    erschliessung,
    raw: feature,
  };
}

function pointInRing(point: [number, number], ring: number[][]) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInPolygon(point: [number, number], polygon: number[][][]) {
  if (!polygon.length || !pointInRing(point, polygon[0])) return false;
  return !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function featureContainsPoint(feature: BorisFeature, lng: number, lat: number) {
  const geometry = feature.geometry;
  if (!geometry?.coordinates) return false;
  const point: [number, number] = [lng, lat];

  if (geometry.type === "Point") {
    const coordinates = geometry.coordinates as [number, number];
    const [featureLng, featureLat] = coordinates;
    return Math.abs(featureLng - lng) < 0.0001 && Math.abs(featureLat - lat) < 0.0001;
  }

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates as number[][][]);
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][]).some((polygon) => pointInPolygon(point, polygon));
  }

  return false;
}

function buildBorisItemsUrl(baseUrl: string, input: ResolveLandValueInput) {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/collections/br_bodenrichtwert/items`);
  url.searchParams.set("f", "json");
  url.searchParams.set("limit", "20");

  if (input.lat != null && input.lng != null) {
    const delta = 0.002;
    url.searchParams.set(
      "bbox",
      [
        input.lng - delta,
        input.lat - delta,
        input.lng + delta,
        input.lat + delta,
      ].join(","),
    );
  }

  return url;
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function getXmlTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<[^:>]*(?::)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/[^:>]*(?::)?${tagName}>`, "i"));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) : null;
}

function getXmlTagBlock(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<[^:>]*(?::)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/[^:>]*(?::)?${tagName}>`, "i"));
  return match?.[1] ?? null;
}

function parseLglnRingFromPosList(posList: string | null) {
  if (!posList) return null;
  const values = posList
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (values.length < 6) return null;

  const ring: number[][] = [];
  for (let index = 0; index < values.length - 1; index += 2) {
    const lat = values[index];
    const lng = values[index + 1];
    ring.push([lng, lat]);
  }

  return ring.length >= 3 ? ring : null;
}

function extractLglnBorisFeatures(xml: string): ParsedLglnFeature[] {
  const features: ParsedLglnFeature[] = [];

  for (const match of xml.matchAll(/<wfs:member\b[^>]*>([\s\S]*?)<\/wfs:member>/gi)) {
    const member = match[1];
    const value = normalizeNumber(getXmlTag(member, "bodenrichtwert"));
    if (!value || value <= 0) continue;

    const featureId =
      member.match(/<boris:BR_BodenrichtwertZonal\b[^>]*gml:id="([^"]+)"/i)?.[1] ??
      getXmlTag(member, "identifier") ??
      null;
    const nutzung = getXmlTagBlock(member, "nutzung");
    const ring = parseLglnRingFromPosList(getXmlTag(member, "posList"));

    features.push({
      bodenrichtwert_eur_m2: value,
      boris_zone_id: getXmlTag(member, "bodenrichtwertNummer") ?? featureId,
      stichtag: normalizeDate(getXmlTag(member, "stichtag")),
      nutzungsart: nutzung ? getXmlTag(nutzung, "art") : null,
      entwicklungszustand: getXmlTag(member, "entwicklungszustand"),
      erschliessung: getXmlTag(member, "beitragsAbgabenrechtlicherZustand"),
      raw: {
        id: featureId,
        bodenrichtwertNummer: getXmlTag(member, "bodenrichtwertNummer"),
        bodenrichtwertzoneName: getXmlTag(member, "bodenrichtwertzoneName"),
        gutachterausschuss: getXmlTag(member, "bezeichnung"),
        stichtag: getXmlTag(member, "stichtag"),
      },
      ring,
    });
  }

  return features;
}

function buildLglnBorisWfsUrl(baseUrl: string, input: ResolveLandValueInput) {
  const url = new URL(baseUrl);
  url.searchParams.set("SERVICE", "WFS");
  url.searchParams.set("VERSION", "2.0.0");
  url.searchParams.set("REQUEST", "GetFeature");
  url.searchParams.set("TYPENAMES", "boris:BR_BodenrichtwertZonal");
  url.searchParams.set("SRSNAME", "EPSG:4326");
  url.searchParams.set("COUNT", "10");

  if (input.lat != null && input.lng != null) {
    const delta = 0.003;
    // WFS 2.0 returns EPSG:4326 as latitude/longitude for this service.
    url.searchParams.set(
      "BBOX",
      [
        input.lat - delta,
        input.lng - delta,
        input.lat + delta,
        input.lng + delta,
        "EPSG:4326",
      ].join(","),
    );
  }

  return url;
}

async function getCachedLandValue(input: ResolveLandValueInput) {
  const rows = (await sql`
    SELECT bodenrichtwert_eur_m2, calculated_land_value, boris_zone_id, source
    FROM land_value_cache
    WHERE expires_at > NOW()
      AND (
        (${input.lat ?? null}::double precision IS NOT NULL AND ${input.lng ?? null}::double precision IS NOT NULL AND ABS(lat - ${input.lat ?? 0}) < 0.0005 AND ABS(lng - ${input.lng ?? 0}) < 0.0005)
        OR (postal_code = ${input.postal_code ?? null} AND city ILIKE ${input.city ?? ""})
      )
    ORDER BY created_at DESC
    LIMIT 1
  `) as LandValueCacheRow[];

  const row = rows[0];
  if (!row?.bodenrichtwert_eur_m2) return null;

  return {
    bodenrichtwert_eur_m2: Number(row.bodenrichtwert_eur_m2),
    calculated_land_value:
      Number(row.calculated_land_value) || Number(row.bodenrichtwert_eur_m2) * input.plot_area,
    boris_zone_id: row.boris_zone_id,
    source: row.source || "cache",
  };
}

async function cacheLandValue(input: ResolveLandValueInput, parsed: ParsedBorisValue, source: string) {
  const value = parsed.bodenrichtwert_eur_m2;
  const calculated = value * input.plot_area;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 180);

  await sql`
    INSERT INTO land_value_cache (
      street,
      house_number,
      postal_code,
      city,
      district,
      landkreis,
      lat,
      lng,
      boris_zone_id,
      bodenrichtwert_eur_m2,
      stichtag,
      nutzungsart,
      entwicklungszustand,
      erschliessung,
      plot_area,
      calculated_land_value,
      source,
      raw_response_json,
      expires_at
    )
    VALUES (
      ${input.street ?? null},
      ${input.house_number ?? null},
      ${input.postal_code ?? null},
      ${input.city ?? null},
      ${input.district ?? null},
      ${input.landkreis ?? null},
      ${input.lat ?? null},
      ${input.lng ?? null},
      ${parsed.boris_zone_id},
      ${value},
      ${parsed.stichtag ?? null},
      ${parsed.nutzungsart ?? input.nutzungsart ?? null},
      ${parsed.entwicklungszustand ?? null},
      ${parsed.erschliessung ?? input.erschliessung ?? null},
      ${input.plot_area},
      ${calculated},
      ${source},
      ${JSON.stringify(parsed.raw)}::jsonb,
      ${expiresAt}
    )
  `;

  return {
    bodenrichtwert_eur_m2: value,
    calculated_land_value: calculated,
    boris_zone_id: parsed.boris_zone_id,
    source,
  };
}

async function fetchLglnBorisWfsValue(input: ResolveLandValueInput, baseUrl: string) {
  if (!isWithinNiedersachsenBorisCoverage(input)) return null;

  const response = await fetch(buildLglnBorisWfsUrl(baseUrl, input), { cache: "no-store" });
  if (!response.ok) return null;

  const xml = await response.text();
  const features = extractLglnBorisFeatures(xml);
  const point: [number, number] | null = input.lat != null && input.lng != null ? [input.lng, input.lat] : null;
  const parsed =
    (point ? features.find((feature) => feature.ring && pointInPolygon(point, [feature.ring])) : null) ??
    features[0] ??
    null;

  if (!parsed) return null;
  return cacheLandValue(input, parsed, "boris_niedersachsen_wfs");
}

async function fetchOgcBorisValue(input: ResolveLandValueInput, baseUrl: string) {
  if (isBrandenburgBorisUrl(baseUrl) && !isWithinBrandenburgBorisCoverage(input)) {
    return null;
  }

  const response = await fetch(buildBorisItemsUrl(baseUrl, input), { cache: "no-store" });
  if (!response.ok) return null;

  const json = (await response.json()) as BorisFeatureCollection;
  const features = Array.isArray(json.features) ? json.features : [];
  const pointFeature =
    input.lat != null && input.lng != null
      ? features.find((feature) => featureContainsPoint(feature, input.lng!, input.lat!))
      : null;
  const parsed = extractBorisFeatureData(pointFeature ?? features[0] ?? {});

  if (!parsed) return null;
  return cacheLandValue(input, parsed, isBrandenburgBorisUrl(baseUrl) ? "boris_brandenburg_ogc" : "boris_ogc");
}

async function fetchBorisValue(input: ResolveLandValueInput) {
  const baseUrl = env.BORIS_API_URL || DEFAULT_BORIS_API_URL;
  if (isLglnBorisWfsUrl(baseUrl)) return fetchLglnBorisWfsValue(input, baseUrl);
  return fetchOgcBorisValue(input, baseUrl);
}

export async function resolveLandValue(input: ResolveLandValueInput): Promise<ResolvedLandValue | null> {
  const cached = await getCachedLandValue(input);
  if (cached) return cached;
  return fetchBorisValue(input);
}
