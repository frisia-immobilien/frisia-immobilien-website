import "server-only";

import fs from "node:fs";
import path from "node:path";

import { readActiveSnapshotJson } from "@/lib/website-snapshot";
import { toLocationSlug } from "@/lib/market/normalizeLocation";
import type {
  MarketDataRow,
  MarketObjectType,
  PriceHistoryRow,
  SeoLocationContentRow,
  SeoLocationRow,
} from "@/lib/types/leadgen";

type RuntimeMarketRecord = Partial<MarketDataRow> & {
  object_type?: MarketObjectType | null;
  objektart?: string | null;
  postal_codes?: string[] | null;
  efh_median_preis_eur?: number | string | null;
  wohnung_median_preis_eur?: number | string | null;
  median_2016?: number | string | null;
  median_2017?: number | string | null;
  median_2018?: number | string | null;
  median_2019?: number | string | null;
  median_2020?: number | string | null;
  median_2021?: number | string | null;
  median_2022?: number | string | null;
  median_2023?: number | string | null;
  median_2024?: number | string | null;
  median_2025?: number | string | null;
  auswertung_vom?: string | null;
  Erstellt_am?: string | null;
};

type RuntimeWebsiteLocation = {
  location_slug?: string | null;
  location_label?: string | null;
  location_type?: SeoLocationRow["location_type"] | string | null;
  landkreis?: string | null;
  stadt_gemeinde?: string | null;
  ortsteil?: string | null;
  plz?: string | null;
  website_live?: boolean | null;
  leadgen_live?: boolean | null;
  landingpage_geeignet?: boolean | null;
  sitemap_indexable?: boolean | null;
  route_count?: number | string | null;
};

type RuntimeContentPayload = {
  content?: SeoLocationContentRow[];
};

type RuntimeImageRow = {
  location_slug?: string | null;
  page_type?: string | null;
  image_type?: string | null;
  file_path?: string | null;
  alt_text?: string | null;
  title?: string | null;
  caption?: string | null;
  sort_order?: number | string | null;
};

type RuntimeImagePayload = {
  images?: RuntimeImageRow[];
};

type RuntimePriceHistoryPayload = {
  rows?: PriceHistoryRow[];
};

const STRATEGIC_LOCATION_SLUGS = new Set([
  "aurich",
  "ostfriesland",
  "emden",
  "leer",
  "wittmund",
  "norden",
]);

let runtimeRecordsCache: RuntimeMarketRecord[] | null = null;
let runtimeLocationsCache: RuntimeWebsiteLocation[] | null = null;
let runtimeContentCache: SeoLocationContentRow[] | null = null;
let runtimeImagesCache: RuntimeImageRow[] | null = null;
let runtimePriceHistoryCache: PriceHistoryRow[] | null = null;

function runtimeFilePath(fileName: string) {
  const candidates = [
    path.join(process.cwd(), "data", "market", "runtime", fileName),
    path.join(process.cwd(), "..", "data", "market", "runtime", fileName),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function isPublicSlug(slug: string | null | undefined): slug is string {
  return Boolean(slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
}

function loadRuntimeRecords() {
  if (runtimeRecordsCache) return runtimeRecordsCache;
  const snapshot = readActiveSnapshotJson<{ records?: RuntimeMarketRecord[] }>("leadgen_market_data");
  if (Array.isArray(snapshot?.records)) {
    runtimeRecordsCache = snapshot.records;
    return runtimeRecordsCache;
  }

  const filePath = runtimeFilePath("leadgen_market_data.json");
  if (!filePath) {
    runtimeRecordsCache = [];
    return runtimeRecordsCache;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as { records?: RuntimeMarketRecord[] };
    runtimeRecordsCache = Array.isArray(raw.records) ? raw.records : [];
  } catch {
    runtimeRecordsCache = [];
  }

  return runtimeRecordsCache;
}

function loadRuntimeLocations() {
  if (runtimeLocationsCache) return runtimeLocationsCache;
  const snapshot = readActiveSnapshotJson<{ locations?: RuntimeWebsiteLocation[] }>("website_locations");
  if (Array.isArray(snapshot?.locations)) {
    runtimeLocationsCache = snapshot.locations;
    return runtimeLocationsCache;
  }

  const filePath = runtimeFilePath("website_locations.json");
  if (!filePath) {
    runtimeLocationsCache = [];
    return runtimeLocationsCache;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as { locations?: RuntimeWebsiteLocation[] };
    runtimeLocationsCache = Array.isArray(raw.locations) ? raw.locations : [];
  } catch {
    runtimeLocationsCache = [];
  }

  return runtimeLocationsCache;
}

function loadRuntimeContent() {
  if (runtimeContentCache) return runtimeContentCache;
  const snapshot = readActiveSnapshotJson<RuntimeContentPayload>("seo_location_content");
  runtimeContentCache = Array.isArray(snapshot?.content) ? snapshot.content : [];
  return runtimeContentCache;
}

function loadRuntimeImages() {
  if (runtimeImagesCache) return runtimeImagesCache;
  const snapshot = readActiveSnapshotJson<RuntimeImagePayload>("seo_location_images");
  runtimeImagesCache = Array.isArray(snapshot?.images) ? snapshot.images : [];
  return runtimeImagesCache;
}

function loadRuntimePriceHistoryRows() {
  if (runtimePriceHistoryCache) return runtimePriceHistoryCache;
  const snapshot = readActiveSnapshotJson<RuntimePriceHistoryPayload>("price_history");
  runtimePriceHistoryCache = Array.isArray(snapshot?.rows) ? snapshot.rows : [];
  return runtimePriceHistoryCache;
}

function runtimeObjectType(record: RuntimeMarketRecord): MarketObjectType | null {
  if (record.object_type === "haus" || record.object_type === "wohnung") return record.object_type;

  const label = String(record.objektart ?? "").toLocaleLowerCase("de-DE");
  if (label.includes("wohnung")) return "wohnung";
  if (label.includes("haus")) return "haus";
  return null;
}

function runtimeSlugCandidates(record: RuntimeMarketRecord) {
  return [
    record.ortsteil_slug,
    record.stadt_gemeinde_slug,
    record.landkreis_slug,
    record.region_slug,
    isPublicSlug(record.location_slug) ? record.location_slug : null,
  ].filter((slug): slug is string => isPublicSlug(slug));
}

function publicSlug(record: RuntimeMarketRecord | RuntimeWebsiteLocation) {
  if ("ortsteil_slug" in record) {
    return record.ortsteil_slug || record.stadt_gemeinde_slug || record.landkreis_slug || record.region_slug || null;
  }
  return record.location_slug || null;
}

function matchRank(record: RuntimeMarketRecord, locationSlug: string) {
  if (record.datensatz_typ === "ortsteil" && record.ortsteil_slug === locationSlug) return 0;
  if (record.datensatz_typ === "stadt_gemeinde" && record.stadt_gemeinde_slug === locationSlug) return 1;
  if (record.landkreis_slug === locationSlug) return 2;
  if (record.region_slug === locationSlug) return 3;
  return runtimeSlugCandidates(record).includes(locationSlug) ? 4 : 99;
}

function hasPrice(record: RuntimeMarketRecord) {
  return Boolean(toNumber(record.median_preis_eur_m2) ?? toNumber(record.durchschnitt_preis_eur_m2));
}

function bestRuntimeRecord(locationSlug: string, objectType: MarketObjectType) {
  const normalizedSlug = toLocationSlug(locationSlug);
  const [record] = loadRuntimeRecords()
    .filter((item) => item.landingpage_geeignet !== false)
    .filter((item) => runtimeObjectType(item) === objectType)
    .filter((item) => matchRank(item, normalizedSlug) < 99)
    .filter(hasPrice)
    .sort((a, b) => {
      const rank = matchRank(a, normalizedSlug) - matchRank(b, normalizedSlug);
      if (rank !== 0) return rank;
      return Number(b.verkaeufe_anzahl ?? 0) - Number(a.verkaeufe_anzahl ?? 0);
    });

  return record ?? null;
}

function mapRuntimeMarket(record: RuntimeMarketRecord, objectType: MarketObjectType): MarketDataRow {
  const resolvedObjectType = runtimeObjectType(record) ?? objectType;
  const slug = publicSlug(record) || record.location_slug || `${resolvedObjectType}-runtime`;
  const createdAt = String(record.created_at ?? record.Erstellt_am ?? "");
  const updatedAt = String(record.updated_at ?? record.auswertung_vom ?? createdAt);

  return {
    id: String(record.id ?? record.location_id ?? `${resolvedObjectType}-${slug}`),
    object_type: resolvedObjectType,
    region_code: record.region_code ?? null,
    landkreis: record.landkreis ?? null,
    stadt_gemeinde: record.stadt_gemeinde ?? null,
    ortsteil: record.ortsteil ?? null,
    datensatz_typ: String(record.datensatz_typ ?? "stadt_gemeinde"),
    location_id: record.location_id ?? null,
    parent_location_id: record.parent_location_id ?? null,
    location_label: record.location_label ?? record.ortsteil ?? record.stadt_gemeinde ?? null,
    parent_label: record.parent_label ?? null,
    location_join_key: record.location_join_key ?? "",
    parent_join_key: record.parent_join_key ?? null,
    region_slug: record.region_slug ?? null,
    landkreis_slug: record.landkreis_slug ?? null,
    stadt_gemeinde_slug: record.stadt_gemeinde_slug ?? null,
    ortsteil_slug: record.ortsteil_slug ?? null,
    location_slug: publicSlug(record) ?? record.location_slug ?? null,
    objektart: record.objektart ?? null,
    plz: record.plz ?? null,
    plz_bereiche: record.plz_bereiche ?? null,
    leadgen_geeignet: record.leadgen_geeignet === true,
    leadgen_scope: record.leadgen_scope ?? null,
    landingpage_geeignet: record.landingpage_geeignet !== false,
    landingpage_scope: record.landingpage_scope ?? null,
    verkaeufe_anzahl: toNumber(record.verkaeufe_anzahl),
    min_preis_eur_m2: toNumber(record.min_preis_eur_m2),
    quantil_01_preis_eur_m2: toNumber(record.quantil_01_preis_eur_m2),
    median_preis_eur_m2: toNumber(record.median_preis_eur_m2),
    durchschnitt_preis_eur_m2: toNumber(record.durchschnitt_preis_eur_m2),
    quantil_09_preis_eur_m2: toNumber(record.quantil_09_preis_eur_m2),
    max_preis_eur_m2: toNumber(record.max_preis_eur_m2),
    delta_vorjahr_median_prozent: toNumber(record.delta_vorjahr_median_prozent),
    median_preis_eur:
      toNumber(record.median_preis_eur) ??
      toNumber(record.efh_median_preis_eur) ??
      toNumber(record.wohnung_median_preis_eur),
    tage_am_markt: toNumber(record.tage_am_markt),
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function normalizeLocationType(value: unknown): SeoLocationRow["location_type"] {
  if (value === "region" || value === "landkreis" || value === "ortsteil") return value;
  return "stadt_gemeinde";
}

function parentLocationSlug(location: RuntimeWebsiteLocation) {
  if (location.location_type === "ortsteil" && location.stadt_gemeinde) {
    return toLocationSlug(location.stadt_gemeinde);
  }
  return null;
}

function mapRuntimeLocation(location: RuntimeWebsiteLocation): SeoLocationRow | null {
  const slug = location.location_slug;
  if (!isPublicSlug(slug)) return null;

  const priority = STRATEGIC_LOCATION_SLUGS.has(slug) ? 100 : 50;
  return {
    id: slug,
    location_slug: slug,
    location_label: location.location_label || location.ortsteil || location.stadt_gemeinde || slug,
    location_type: normalizeLocationType(location.location_type),
    stadt_gemeinde: location.stadt_gemeinde ?? null,
    ortsteil: location.ortsteil ?? null,
    landkreis: location.landkreis ?? null,
    region: "Ostfriesland",
    plz: location.plz ?? null,
    lat: null,
    lng: null,
    parent_location_slug: parentLocationSlug(location),
    landingpage_geeignet: location.landingpage_geeignet !== false,
    leadgen_geeignet: location.leadgen_live === true || location.leadgen_live === undefined,
    priority,
    indexable: location.sitemap_indexable !== false,
    created_at: "",
    updated_at: "",
  };
}

export function getRuntimeLocationBySlug(locationSlug: string): SeoLocationRow | null {
  const normalizedSlug = toLocationSlug(locationSlug);
  const runtimeLocation = loadRuntimeLocations().find((location) => location.location_slug === normalizedSlug);
  const mappedLocation = runtimeLocation ? mapRuntimeLocation(runtimeLocation) : null;
  if (mappedLocation) return mappedLocation;

  const record = loadRuntimeRecords().find((item) => runtimeSlugCandidates(item).includes(normalizedSlug));
  if (!record) return null;

  return {
    id: normalizedSlug,
    location_slug: normalizedSlug,
    location_label: record.location_label ?? record.ortsteil ?? record.stadt_gemeinde ?? normalizedSlug,
    location_type: normalizeLocationType(record.datensatz_typ),
    stadt_gemeinde: record.stadt_gemeinde ?? null,
    ortsteil: record.ortsteil ?? null,
    landkreis: record.landkreis ?? null,
    region: "Ostfriesland",
    plz: record.plz ?? null,
    lat: null,
    lng: null,
    parent_location_slug: record.datensatz_typ === "ortsteil" ? record.stadt_gemeinde_slug ?? null : null,
    landingpage_geeignet: record.landingpage_geeignet !== false,
    leadgen_geeignet: record.leadgen_geeignet === true,
    priority: STRATEGIC_LOCATION_SLUGS.has(normalizedSlug) ? 100 : 50,
    indexable: record.landingpage_geeignet !== false,
    created_at: String(record.created_at ?? record.Erstellt_am ?? ""),
    updated_at: String(record.updated_at ?? record.auswertung_vom ?? ""),
  };
}

export function getRuntimeNearbyLocations(location: SeoLocationRow, limit = 12): SeoLocationRow[] {
  return loadRuntimeLocations()
    .map(mapRuntimeLocation)
    .filter((item): item is SeoLocationRow => Boolean(item))
    .filter((item) => item.location_slug !== location.location_slug)
    .filter((item) => item.indexable)
    .filter(
      (item) =>
        item.parent_location_slug === location.parent_location_slug ||
        item.parent_location_slug === location.location_slug ||
        item.landkreis === location.landkreis,
    )
    .sort((a, b) => b.priority - a.priority || a.location_label.localeCompare(b.location_label, "de"))
    .slice(0, limit);
}

export function getRuntimeMarket(locationSlug: string, objectType: MarketObjectType): MarketDataRow | null {
  const record = bestRuntimeRecord(locationSlug, objectType);
  return record ? mapRuntimeMarket(record, objectType) : null;
}

export function getRuntimePriceHistory(locationSlug: string, objectType: MarketObjectType): PriceHistoryRow[] {
  const normalizedSlug = toLocationSlug(locationSlug);
  const snapshotRows = loadRuntimePriceHistoryRows()
    .filter((row) => row.location_slug === normalizedSlug && row.object_type === objectType)
    .filter((row) => row.median_preis_eur_m2 !== null)
    .sort((a, b) => Number(a.year) - Number(b.year));

  if (snapshotRows.length > 0) return snapshotRows;

  const record = bestRuntimeRecord(locationSlug, objectType);
  if (!record) return [];

  const slug = publicSlug(record) || toLocationSlug(locationSlug);
  const createdAt = String(record.created_at ?? record.Erstellt_am ?? "");
  const updatedAt = String(record.updated_at ?? record.auswertung_vom ?? createdAt);

  return [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    .map((year) => ({
      id: `${objectType}-${slug}-${year}-runtime`,
      object_type: objectType,
      location_slug: slug,
      year,
      median_preis_eur_m2: toNumber(record[`median_${year}` as keyof RuntimeMarketRecord]),
      durchschnitt_preis_eur_m2: null,
      verkaeufe_anzahl: toNumber(record.verkaeufe_anzahl),
      data_quality: "runtime_json",
      created_at: createdAt,
      updated_at: updatedAt,
    }))
    .filter((row) => row.median_preis_eur_m2 !== null);
}

export function getRuntimeContent(locationSlug: string, pageType: string): SeoLocationContentRow | null {
  const normalizedSlug = toLocationSlug(locationSlug);
  return (
    loadRuntimeContent().find(
      (row) => row.location_slug === normalizedSlug && row.page_type === pageType,
    ) ?? null
  );
}

export function getRuntimeLocationImage(input: {
  location_slug: string;
  page_type: string;
}) {
  const normalizedSlug = toLocationSlug(input.location_slug);
  return (
    loadRuntimeImages()
      .filter(
        (row) =>
          row.location_slug === normalizedSlug &&
          row.page_type === input.page_type &&
          (row.image_type || "hero") === "hero" &&
          Boolean(row.file_path),
      )
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))[0] ?? null
  );
}
