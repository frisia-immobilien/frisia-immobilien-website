import "server-only";

import fs from "node:fs";
import path from "node:path";

import { sql } from "@/lib/db";
import { normalizePostalCode, toLocationSlug } from "@/lib/market/normalizeLocation";
import type { MarketDataRow, MarketObjectType } from "@/lib/types/leadgen";

export type MarketCoverageLevel = "ortsteil" | "stadt_gemeinde" | "plz" | "none";

export type MarketCoverageInput = {
  object_type?: MarketObjectType | null;
  city?: string | null;
  district?: string | null;
  postal_code?: string | null;
};

export type MarketCoverageResult = {
  covered: boolean;
  regionHint: "aurich" | "ostfriesland" | "other";
  marketLevel: MarketCoverageLevel;
  locationLabel: string | null;
  leadgenGeeignet: boolean;
  hasPrice: boolean;
};

type RuntimeMarketRecord = Partial<MarketDataRow> & {
  objektart?: string | null;
  postal_codes?: string[] | null;
};

let runtimeRecordsCache: RuntimeMarketRecord[] | null = null;

function hasPrice(row: MarketDataRow | null | undefined) {
  return Boolean(row?.median_preis_eur_m2 || row?.durchschnitt_preis_eur_m2);
}

function marketLevel(row: MarketDataRow | null | undefined, fallback: MarketCoverageLevel): MarketCoverageLevel {
  if (!row) return "none";
  if (row.datensatz_typ === "ortsteil") return "ortsteil";
  if (row.datensatz_typ === "stadt_gemeinde") return "stadt_gemeinde";
  return fallback;
}

function mapCoverage(row: MarketDataRow | null | undefined, fallbackLevel: MarketCoverageLevel): MarketCoverageResult {
  if (!row) {
    return {
      covered: false,
      regionHint: "other",
      marketLevel: "none",
      locationLabel: null,
      leadgenGeeignet: false,
      hasPrice: false,
    };
  }

  const citySlug = row.stadt_gemeinde_slug || row.location_slug || "";
  return {
    covered: true,
    regionHint: citySlug === "aurich" ? "aurich" : "ostfriesland",
    marketLevel: marketLevel(row, fallbackLevel),
    locationLabel: row.location_label || row.ortsteil || row.stadt_gemeinde || row.plz || null,
    leadgenGeeignet: row.leadgen_geeignet === true,
    hasPrice: hasPrice(row),
  };
}

function runtimeMarketDataPath() {
  const candidates = [
    path.join(process.cwd(), "..", "data", "market", "runtime", "leadgen_market_data.json"),
    path.join(process.cwd(), "data", "market", "runtime", "leadgen_market_data.json"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function getRuntimeRecords() {
  if (runtimeRecordsCache) return runtimeRecordsCache;
  const filePath = runtimeMarketDataPath();
  if (!filePath) {
    runtimeRecordsCache = [];
    return runtimeRecordsCache;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as { records?: RuntimeMarketRecord[] };
  runtimeRecordsCache = Array.isArray(raw.records) ? raw.records : [];
  return runtimeRecordsCache;
}

function runtimeObjectType(record: RuntimeMarketRecord): MarketObjectType | null {
  if (record.object_type === "haus" || record.object_type === "wohnung") return record.object_type;

  const label = String(record.objektart ?? "").toLocaleLowerCase("de-DE");
  if (label.includes("wohnung")) return "wohnung";
  if (label.includes("haus")) return "haus";
  return null;
}

function includesPostalCode(record: RuntimeMarketRecord, postalCode: string) {
  if (!postalCode) return true;
  if (record.plz === postalCode) return true;
  if (Array.isArray(record.postal_codes) && record.postal_codes.includes(postalCode)) return true;
  return String(record.plz_bereiche ?? "")
    .split(",")
    .map((item) => item.trim())
    .includes(postalCode);
}

function toMarketDataRow(record: RuntimeMarketRecord, objectType: MarketObjectType | null): MarketDataRow {
  const resolvedObjectType = runtimeObjectType(record) ?? objectType ?? "haus";

  return {
    id: record.id ?? record.location_id ?? record.location_slug ?? `${resolvedObjectType}-${record.location_label ?? "runtime"}`,
    object_type: resolvedObjectType,
    region_code: record.region_code ?? null,
    landkreis: record.landkreis ?? null,
    stadt_gemeinde: record.stadt_gemeinde ?? null,
    ortsteil: record.ortsteil ?? null,
    datensatz_typ: record.datensatz_typ ?? "stadt_gemeinde",
    location_id: record.location_id ?? null,
    parent_location_id: record.parent_location_id ?? null,
    location_label: record.location_label ?? null,
    parent_label: record.parent_label ?? null,
    location_join_key: record.location_join_key ?? "",
    parent_join_key: record.parent_join_key ?? null,
    region_slug: record.region_slug ?? null,
    landkreis_slug: record.landkreis_slug ?? null,
    stadt_gemeinde_slug: record.stadt_gemeinde_slug ?? null,
    ortsteil_slug: record.ortsteil_slug ?? null,
    location_slug: record.location_slug ?? null,
    objektart: record.objektart ?? null,
    plz: record.plz ?? null,
    plz_bereiche: record.plz_bereiche ?? null,
    leadgen_geeignet: record.leadgen_geeignet === true,
    leadgen_scope: record.leadgen_scope ?? null,
    landingpage_geeignet: record.landingpage_geeignet === true,
    landingpage_scope: record.landingpage_scope ?? null,
    verkaeufe_anzahl: record.verkaeufe_anzahl ?? null,
    min_preis_eur_m2: record.min_preis_eur_m2 ?? null,
    quantil_01_preis_eur_m2: record.quantil_01_preis_eur_m2 ?? null,
    median_preis_eur_m2: record.median_preis_eur_m2 ?? null,
    durchschnitt_preis_eur_m2: record.durchschnitt_preis_eur_m2 ?? null,
    quantil_09_preis_eur_m2: record.quantil_09_preis_eur_m2 ?? null,
    max_preis_eur_m2: record.max_preis_eur_m2 ?? null,
    delta_vorjahr_median_prozent: record.delta_vorjahr_median_prozent ?? null,
    median_preis_eur: record.median_preis_eur ?? null,
    tage_am_markt: record.tage_am_markt ?? null,
    created_at: record.created_at ?? "",
    updated_at: record.updated_at ?? "",
  };
}

function bestRuntimeRecord(records: RuntimeMarketRecord[], objectType: MarketObjectType | null) {
  const [bestRecord] = [...records].sort((a, b) => {
    if (a.leadgen_geeignet !== b.leadgen_geeignet) return a.leadgen_geeignet ? -1 : 1;
    if (hasPrice(a as MarketDataRow) !== hasPrice(b as MarketDataRow)) return hasPrice(a as MarketDataRow) ? -1 : 1;
    return Number(b.verkaeufe_anzahl ?? 0) - Number(a.verkaeufe_anzahl ?? 0);
  });

  return bestRecord ? toMarketDataRow(bestRecord, objectType) : null;
}

function resolveRuntimeCoverage(input: MarketCoverageInput): MarketCoverageResult {
  const objectType = input.object_type ?? null;
  const citySlug = toLocationSlug(input.city);
  const districtSlug = toLocationSlug(input.district);
  const postalCode = normalizePostalCode(input.postal_code);
  const records = getRuntimeRecords().filter((record) => {
    if (record.leadgen_geeignet === false) return false;
    if (objectType && runtimeObjectType(record) !== objectType) return false;
    return true;
  });

  if (citySlug && districtSlug) {
    const row = bestRuntimeRecord(
      records.filter(
        (record) =>
          record.datensatz_typ === "ortsteil" &&
          record.stadt_gemeinde_slug === citySlug &&
          record.ortsteil_slug === districtSlug &&
          includesPostalCode(record, postalCode),
      ),
      objectType,
    );

    if (row) return mapCoverage(row, "ortsteil");
  }

  if (citySlug) {
    const row = bestRuntimeRecord(
      records.filter(
        (record) =>
          record.datensatz_typ === "stadt_gemeinde" &&
          record.stadt_gemeinde_slug === citySlug &&
          includesPostalCode(record, postalCode),
      ),
      objectType,
    );

    if (row) return mapCoverage(row, "stadt_gemeinde");
  }

  if (postalCode) {
    const row = bestRuntimeRecord(
      records.filter(
        (record) =>
          (record.datensatz_typ === "stadt_gemeinde" || record.datensatz_typ === "ortsteil") &&
          includesPostalCode(record, postalCode),
      ),
      objectType,
    );

    if (row) return mapCoverage(row, "plz");
  }

  return mapCoverage(null, "none");
}

async function resolveDatabaseCoverage(input: MarketCoverageInput): Promise<MarketCoverageResult> {
  const objectType = input.object_type ?? null;
  const citySlug = toLocationSlug(input.city);
  const districtSlug = toLocationSlug(input.district);
  const postalCode = normalizePostalCode(input.postal_code);

  if (citySlug && districtSlug) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE (${objectType}::text IS NULL OR object_type = ${objectType})
        AND datensatz_typ = 'ortsteil'
        AND stadt_gemeinde_slug = ${citySlug}
        AND ortsteil_slug = ${districtSlug}
      ORDER BY
        leadgen_geeignet DESC,
        CASE WHEN median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (rows[0]) return mapCoverage(rows[0], "ortsteil");
  }

  if (citySlug) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE (${objectType}::text IS NULL OR object_type = ${objectType})
        AND datensatz_typ = 'stadt_gemeinde'
        AND stadt_gemeinde_slug = ${citySlug}
      ORDER BY
        leadgen_geeignet DESC,
        CASE WHEN median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (rows[0]) return mapCoverage(rows[0], "stadt_gemeinde");
  }

  if (postalCode) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE (${objectType}::text IS NULL OR object_type = ${objectType})
        AND datensatz_typ IN ('stadt_gemeinde', 'ortsteil')
        AND (plz = ${postalCode} OR plz_bereiche ILIKE ${`%${postalCode}%`})
      ORDER BY
        leadgen_geeignet DESC,
        CASE WHEN datensatz_typ = 'stadt_gemeinde' THEN 0 ELSE 1 END,
        CASE WHEN median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (rows[0]) return mapCoverage(rows[0], "plz");
  }

  return mapCoverage(null, "none");
}

export async function resolveMarketCoverage(input: MarketCoverageInput): Promise<MarketCoverageResult> {
  try {
    const databaseCoverage = await resolveDatabaseCoverage(input);
    if (databaseCoverage.covered) return databaseCoverage;
  } catch (error) {
    console.error("market coverage database lookup failed", error);
  }

  try {
    return resolveRuntimeCoverage(input);
  } catch (error) {
    console.error("market coverage runtime lookup failed", error);
    return mapCoverage(null, "none");
  }
}
