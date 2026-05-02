import "server-only";

import { sql } from "@/lib/db";
import { normalizePostalCode, toLocationSlug } from "@/lib/market/normalizeLocation";
import type { MarketDataRow, MarketObjectType, MarketLevelUsed } from "@/lib/types/leadgen";

export type ResolveMarketDataInput = {
  object_type: MarketObjectType;
  city?: string | null;
  district?: string | null;
  landkreis?: string | null;
  postal_code?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type ResolvedMarketData = {
  market_data_id: string;
  median_preis_eur_m2: number;
  durchschnitt_preis_eur_m2: number | null;
  min_preis_eur_m2: number | null;
  quantil_01_preis_eur_m2: number | null;
  quantil_09_preis_eur_m2: number | null;
  max_preis_eur_m2: number | null;
  market_level_used: MarketLevelUsed;
  verkaeufe_anzahl: number | null;
  tage_am_markt: number | null;
  delta_vorjahr_median_prozent: number | null;
  row: MarketDataRow;
};

function toFiniteNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function hasPrice(row: MarketDataRow | null | undefined) {
  return (
    toFiniteNumber(row?.median_preis_eur_m2) !== null ||
    toFiniteNumber(row?.durchschnitt_preis_eur_m2) !== null
  );
}

function mapResolved(row: MarketDataRow, market_level_used: MarketLevelUsed): ResolvedMarketData {
  const valuationPrice = toFiniteNumber(row.median_preis_eur_m2) ?? toFiniteNumber(row.durchschnitt_preis_eur_m2);
  if (valuationPrice === null) throw new Error("Marktdatensatz ohne Preisbasis kann nicht bewertet werden.");

  return {
    market_data_id: row.id,
    median_preis_eur_m2: valuationPrice,
    durchschnitt_preis_eur_m2: toFiniteNumber(row.durchschnitt_preis_eur_m2),
    min_preis_eur_m2: toFiniteNumber(row.min_preis_eur_m2),
    quantil_01_preis_eur_m2: toFiniteNumber(row.quantil_01_preis_eur_m2),
    quantil_09_preis_eur_m2: toFiniteNumber(row.quantil_09_preis_eur_m2),
    max_preis_eur_m2: toFiniteNumber(row.max_preis_eur_m2),
    market_level_used,
    verkaeufe_anzahl: toFiniteNumber(row.verkaeufe_anzahl),
    tage_am_markt: toFiniteNumber(row.tage_am_markt),
    delta_vorjahr_median_prozent: toFiniteNumber(row.delta_vorjahr_median_prozent),
    row,
  };
}

export async function resolveMarketData(input: ResolveMarketDataInput): Promise<ResolvedMarketData | null> {
  const citySlug = toLocationSlug(input.city);
  const districtSlug = toLocationSlug(input.district);
  const landkreisSlug = toLocationSlug(input.landkreis);
  const postalCode = normalizePostalCode(input.postal_code);

  if (citySlug && districtSlug) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE object_type = ${input.object_type}
        AND datensatz_typ = 'ortsteil'
        AND leadgen_geeignet = TRUE
        AND (median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL)
        AND stadt_gemeinde_slug = ${citySlug}
        AND ortsteil_slug = ${districtSlug}
      ORDER BY
        CASE WHEN median_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        CASE
          WHEN ${postalCode || null}::text IS NOT NULL
            AND (plz = ${postalCode} OR plz_bereiche ILIKE ${postalCode ? `%${postalCode}%` : null})
          THEN 0
          ELSE 1
        END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (hasPrice(rows[0])) return mapResolved(rows[0], "ortsteil");
  }

  if (citySlug) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE object_type = ${input.object_type}
        AND datensatz_typ = 'stadt_gemeinde'
        AND leadgen_geeignet = TRUE
        AND (median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL)
        AND stadt_gemeinde_slug = ${citySlug}
      ORDER BY
        CASE WHEN median_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        CASE
          WHEN ${postalCode || null}::text IS NOT NULL
            AND (plz = ${postalCode} OR plz_bereiche ILIKE ${postalCode ? `%${postalCode}%` : null})
          THEN 0
          ELSE 1
        END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (hasPrice(rows[0])) return mapResolved(rows[0], "stadt_gemeinde");
  }

  if (postalCode) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE object_type = ${input.object_type}
        AND datensatz_typ IN ('stadt_gemeinde', 'ortsteil')
        AND leadgen_geeignet = TRUE
        AND (median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL)
        AND (plz = ${postalCode} OR plz_bereiche ILIKE ${`%${postalCode}%`})
      ORDER BY
        CASE WHEN median_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN datensatz_typ = 'stadt_gemeinde' THEN 0 ELSE 1 END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (hasPrice(rows[0])) {
      return mapResolved(rows[0], rows[0].datensatz_typ === "ortsteil" ? "ortsteil" : "stadt_gemeinde");
    }
  }

  if (landkreisSlug) {
    const rows = (await sql`
      SELECT *
      FROM market_data
      WHERE object_type = ${input.object_type}
        AND datensatz_typ IN ('landkreis', 'region')
        AND leadgen_geeignet = TRUE
        AND (median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL)
        AND (landkreis_slug = ${landkreisSlug} OR region_slug = ${landkreisSlug})
      ORDER BY
        CASE WHEN median_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN datensatz_typ = 'landkreis' THEN 0 ELSE 1 END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];

    if (hasPrice(rows[0])) {
      return mapResolved(rows[0], rows[0].datensatz_typ === "region" ? "region" : "landkreis");
    }
  }

  const regionRows = (await sql`
    SELECT *
    FROM market_data
    WHERE object_type = ${input.object_type}
      AND datensatz_typ = 'region'
      AND leadgen_geeignet = TRUE
      AND (median_preis_eur_m2 IS NOT NULL OR durchschnitt_preis_eur_m2 IS NOT NULL)
    ORDER BY
      CASE WHEN median_preis_eur_m2 IS NOT NULL THEN 0 ELSE 1 END,
      verkaeufe_anzahl DESC NULLS LAST
    LIMIT 1
  `) as MarketDataRow[];

  return hasPrice(regionRows[0]) ? mapResolved(regionRows[0], "region") : null;
}
