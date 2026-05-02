import "server-only";

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

export async function resolveMarketCoverage(input: MarketCoverageInput): Promise<MarketCoverageResult> {
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
