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
  max_preis_eur_m2: number | null;
  market_level_used: MarketLevelUsed;
  verkaeufe_anzahl: number | null;
  tage_am_markt: number | null;
  delta_vorjahr_median_prozent: number | null;
  row: MarketDataRow;
};

function hasPrice(row: MarketDataRow | null | undefined) {
  return typeof row?.median_preis_eur_m2 === "number" && Number.isFinite(row.median_preis_eur_m2);
}

function mapResolved(row: MarketDataRow, market_level_used: MarketLevelUsed): ResolvedMarketData {
  return {
    market_data_id: row.id,
    median_preis_eur_m2: Number(row.median_preis_eur_m2),
    durchschnitt_preis_eur_m2: row.durchschnitt_preis_eur_m2,
    min_preis_eur_m2: row.min_preis_eur_m2,
    max_preis_eur_m2: row.max_preis_eur_m2,
    market_level_used,
    verkaeufe_anzahl: row.verkaeufe_anzahl,
    tage_am_markt: row.tage_am_markt,
    delta_vorjahr_median_prozent: row.delta_vorjahr_median_prozent,
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
        AND median_preis_eur_m2 IS NOT NULL
        AND stadt_gemeinde_slug = ${citySlug}
        AND ortsteil_slug = ${districtSlug}
        AND (${postalCode || null}::text IS NULL OR plz = ${postalCode} OR plz_bereiche ILIKE ${`%${postalCode}%`})
      ORDER BY verkaeufe_anzahl DESC NULLS LAST
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
        AND median_preis_eur_m2 IS NOT NULL
        AND stadt_gemeinde_slug = ${citySlug}
        AND (${postalCode || null}::text IS NULL OR plz = ${postalCode} OR plz_bereiche ILIKE ${`%${postalCode}%`})
      ORDER BY verkaeufe_anzahl DESC NULLS LAST
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
        AND median_preis_eur_m2 IS NOT NULL
        AND (plz = ${postalCode} OR plz_bereiche ILIKE ${`%${postalCode}%`})
      ORDER BY
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
        AND median_preis_eur_m2 IS NOT NULL
        AND (landkreis_slug = ${landkreisSlug} OR region_slug = ${landkreisSlug})
      ORDER BY
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
      AND median_preis_eur_m2 IS NOT NULL
    ORDER BY verkaeufe_anzahl DESC NULLS LAST
    LIMIT 1
  `) as MarketDataRow[];

  return hasPrice(regionRows[0]) ? mapResolved(regionRows[0], "region") : null;
}
