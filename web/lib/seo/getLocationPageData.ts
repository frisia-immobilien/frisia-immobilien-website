import "server-only";

import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getPriceHistory } from "@/lib/market/getPriceHistory";
import { toLocationSlug } from "@/lib/market/normalizeLocation";
import { buildFallbackContent } from "@/lib/seo/getFallbackContent";
import { getLocationImage } from "@/lib/seo/getLocationImage";
import { findTemplateBySlug } from "@/lib/seo/templates";
import { hasValuationIndexInputs } from "@/lib/seo/valuationLanding";
import type {
  MarketDataRow,
  PriceHistoryRow,
  SeoLocationContentRow,
  SeoLocationRow,
} from "@/lib/types/leadgen";

const FIXED_LOCATION_PARENT_FALLBACKS: Record<
  string,
  {
    parentSlug: string;
    parentLabel: string;
    landkreis?: string;
    region?: string;
  }
> = {
  nordeich: {
    parentSlug: "norden",
    parentLabel: "Norden",
    landkreis: "Landkreis Aurich",
    region: "Ostfriesland",
  },
};

export type LocationPageData = {
  slug: string;
  publicPath: string;
  template: NonNullable<ReturnType<typeof findTemplateBySlug>>["template"];
  location: SeoLocationRow;
  content: ReturnType<typeof buildFallbackContent>;
  image: Awaited<ReturnType<typeof getLocationImage>>;
  houseMarket: MarketDataRow | null;
  apartmentMarket: MarketDataRow | null;
  houseHistory: PriceHistoryRow[];
  apartmentHistory: PriceHistoryRow[];
  nearbyLocations: SeoLocationRow[];
  indexable: boolean;
  noindexReason: string | null;
};

async function getLocationBySlug(locationSlug: string) {
  let rows: SeoLocationRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM seo_locations
      WHERE location_slug = ${locationSlug}
      LIMIT 1
    `) as SeoLocationRow[];
  } catch {
    rows = [];
  }

  if (rows[0]) return rows[0];

  const fixedParent = FIXED_LOCATION_PARENT_FALLBACKS[locationSlug];
  const fallbackLabel = locationSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    id: "fallback",
    location_slug: locationSlug,
    location_label: fixedParent ? `${fallbackLabel}, ${fixedParent.parentLabel}` : fallbackLabel,
    location_type: fixedParent ? "ortsteil" as const : "stadt_gemeinde" as const,
    stadt_gemeinde: fixedParent?.parentLabel ?? null,
    ortsteil: fixedParent ? fallbackLabel : null,
    landkreis: fixedParent?.landkreis ?? null,
    region: fixedParent?.region ?? "Ostfriesland",
    plz: null,
    lat: null,
    lng: null,
    parent_location_slug: fixedParent?.parentSlug ?? null,
    landingpage_geeignet: false,
    leadgen_geeignet: false,
    priority: 10,
    indexable: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function getCustomContent(locationSlug: string, pageType: string) {
  let rows: SeoLocationContentRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM seo_location_content
      WHERE location_slug = ${locationSlug}
        AND page_type = ${pageType}
      LIMIT 1
    `) as SeoLocationContentRow[];
  } catch {
    rows = [];
  }
  return rows[0] ?? null;
}

async function getMarket(locationSlug: string, objectType: "haus" | "wohnung") {
  let rows: MarketDataRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM market_data
      WHERE object_type = ${objectType}
        AND landingpage_geeignet = TRUE
        AND median_preis_eur_m2 IS NOT NULL
        AND (
          location_slug = ${locationSlug}
          OR ortsteil_slug = ${locationSlug}
          OR stadt_gemeinde_slug = ${locationSlug}
          OR landkreis_slug = ${locationSlug}
          OR region_slug = ${locationSlug}
        )
      ORDER BY
        CASE
          WHEN location_slug = ${locationSlug} THEN 0
          WHEN ortsteil_slug = ${locationSlug} AND datensatz_typ = 'ortsteil' THEN 1
          WHEN stadt_gemeinde_slug = ${locationSlug} AND datensatz_typ = 'stadt_gemeinde' THEN 2
          WHEN landkreis_slug = ${locationSlug} THEN 3
          WHEN region_slug = ${locationSlug} THEN 4
          ELSE 5
        END,
        verkaeufe_anzahl DESC NULLS LAST
      LIMIT 1
    `) as MarketDataRow[];
  } catch {
    rows = [];
  }
  return rows[0] ?? null;
}

function parentMarketSlugs(location: SeoLocationRow) {
  const fixedFallback = FIXED_LOCATION_PARENT_FALLBACKS[location.location_slug]?.parentSlug;
  const fixedFallbacks = fixedFallback ? [fixedFallback] : [];
  if (location.location_type !== "ortsteil" && fixedFallbacks.length === 0) return [];

  const candidates = [
    location.stadt_gemeinde ? toLocationSlug(location.stadt_gemeinde) : null,
    location.parent_location_slug,
    ...fixedFallbacks,
  ];

  return Array.from(
    new Set(
      candidates.filter(
        (slug): slug is string => Boolean(slug && slug !== location.location_slug),
      ),
    ),
  );
}

async function getMarketWithParentFallback(location: SeoLocationRow, objectType: "haus" | "wohnung") {
  const directMarket = await getMarket(location.location_slug, objectType);
  if (directMarket?.median_preis_eur_m2) return directMarket;

  for (const parentSlug of parentMarketSlugs(location)) {
    const parentMarket = await getMarket(parentSlug, objectType);
    if (parentMarket?.median_preis_eur_m2) return parentMarket;
  }

  return directMarket;
}

async function getNearby(location: SeoLocationRow) {
  let rows: SeoLocationRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM seo_locations
      WHERE location_slug <> ${location.location_slug}
        AND indexable = TRUE
        AND (
          parent_location_slug = ${location.parent_location_slug}
          OR parent_location_slug = ${location.location_slug}
          OR landkreis = ${location.landkreis}
        )
      ORDER BY priority DESC, location_label ASC
      LIMIT 12
    `) as SeoLocationRow[];
  } catch {
    rows = [];
  }
  return rows;
}

export async function getLocationPageData(slug: string): Promise<LocationPageData> {
  const parsed = findTemplateBySlug(slug);
  if (!parsed) notFound();

  const locationSlug = toLocationSlug(parsed.locationSlug);
  const location = await getLocationBySlug(locationSlug);
  const customContent = await getCustomContent(location.location_slug, parsed.template.pageType);
  const houseMarket = await getMarketWithParentFallback(location, "haus");
  const apartmentMarket = await getMarketWithParentFallback(location, "wohnung");
  const image = await getLocationImage({
    location_slug: location.location_slug,
    page_type: parsed.template.pageType,
    location_label: location.location_label,
    location_type: location.location_type,
  });
  const houseHistory = await getPriceHistory({ object_type: "haus", location_slug: location.location_slug });
  const apartmentHistory = await getPriceHistory({ object_type: "wohnung", location_slug: location.location_slug });
  const nearbyLocations = await getNearby(location);
  const content = buildFallbackContent({
    template: parsed.template,
    locationLabel: location.location_label,
    content: customContent,
  });

  const hasMarketData = Boolean(houseMarket?.median_preis_eur_m2 || apartmentMarket?.median_preis_eur_m2);
  const hasCustomText = Boolean(customContent?.custom_intro || customContent?.custom_text_1);
  const isStrategic = location.priority >= 90 || ["aurich", "ostfriesland", "emden", "leer", "wittmund", "norden"].includes(location.location_slug);
  const valuationIndexable =
    parsed.template.pageType === "immobilienbewertung"
      ? hasValuationIndexInputs({ location, houseMarket, apartmentMarket })
      : null;
  const indexable =
    valuationIndexable ?? Boolean(location.indexable && (hasMarketData || hasCustomText || isStrategic));
  const noindexReason = indexable
    ? null
    : parsed.template.pageType === "immobilienbewertung"
      ? "Für die Indexierung der Bewertungsseite fehlen Hauspreis, Wohnungspreis oder Vermarktungsdauer."
      : "Keine ausreichenden Daten, kein Individualtext oder zu wenig strategischer Mehrwert.";

  return {
    slug,
    publicPath: `/${slug}`,
    template: parsed.template,
    location,
    content,
    image,
    houseMarket,
    apartmentMarket,
    houseHistory,
    apartmentHistory,
    nearbyLocations,
    indexable,
    noindexReason,
  };
}
