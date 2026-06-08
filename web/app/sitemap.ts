import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";
import { REGION_LANDING_EXAMPLES } from "@/lib/regions";
import { absoluteUrl } from "@/lib/site";
import { hasActiveWebsiteSnapshot, readActiveSnapshotJson } from "@/lib/website-snapshot";

export const revalidate = 86400;

type SitemapEntry = MetadataRoute.Sitemap[number];
type LocationType = "region" | "landkreis" | "stadt_gemeinde" | "ortsteil";
type PageType =
  | "immobilienmakler"
  | "immobilienbewertung"
  | "haus_verkaufen"
  | "immobilie_verkaufen"
  | "haus_kaufen"
  | "immobilien"
  | "immobilienpreise";

type StaticRoute = {
  path: string;
  priority: number;
};

type DynamicRoute = {
  pageType: PageType;
  prefix: string;
  priority: number;
};

type InternalSitemapEntry = {
  entry: SitemapEntry;
  priority: number;
};

type SitemapLocation = {
  location_slug: string;
  location_type: LocationType;
  stadt_gemeinde: string | null;
  parent_location_slug: string | null;
  priority: number;
  indexable: boolean;
  lastModified: Date | null;
};

type MarketSummary = {
  median: boolean;
  daysOnMarket: boolean;
  salesCount: number;
  lastModified: Date | null;
};

type MarketLookup = Map<string, MarketSummary>;
type ContentLookup = Map<string, Date | null>;

type SitemapSourceData = {
  locations: SitemapLocation[];
  markets: {
    haus: MarketLookup;
    wohnung: MarketLookup;
  };
  content: ContentLookup;
};

type DatabaseLocationRow = {
  location_slug: string | null;
  location_type: LocationType | null;
  stadt_gemeinde: string | null;
  parent_location_slug: string | null;
  priority: number | string | null;
  indexable: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type DatabaseMarketRow = {
  object_type: "haus" | "wohnung" | string | null;
  location_slug: string | null;
  ortsteil_slug: string | null;
  stadt_gemeinde_slug: string | null;
  landkreis_slug: string | null;
  region_slug: string | null;
  median_preis_eur_m2: number | string | null;
  tage_am_markt: number | string | null;
  verkaeufe_anzahl: number | string | null;
  created_at: string | null;
  updated_at: string | null;
};

type DatabaseContentRow = {
  location_slug: string | null;
  page_type: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RuntimeMarketRecord = {
  datensatz_typ?: string | null;
  objektart?: string | null;
  region_slug?: string | null;
  landkreis_slug?: string | null;
  stadt_gemeinde_slug?: string | null;
  ortsteil_slug?: string | null;
  location_slug?: string | null;
  stadt_gemeinde?: string | null;
  parent_location_slug?: string | null;
  landingpage_geeignet?: boolean | null;
  verkaeufe_anzahl?: number | string | null;
  median_preis_eur_m2?: number | string | null;
  tage_am_markt?: number | string | null;
  Erstellt_am?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", priority: 1 },
  { path: "/immobilienbewertung", priority: 0.9 },
  { path: "/immobilie-bewerten", priority: 0.84 },
  { path: "/immobilienpreise", priority: 0.86 },
  { path: "/haus-verkaufen", priority: 0.86 },
  { path: "/haus-kaufen", priority: 0.78 },
  { path: "/immobilienbewertung-aurich", priority: 0.92 },
  { path: "/haus-verkaufen-aurich", priority: 0.92 },
  { path: "/immobilie-verkaufen-aurich", priority: 0.9 },
  { path: "/haus-kaufen-aurich", priority: 0.82 },
  { path: "/immobilien-aurich", priority: 0.86 },
  { path: "/suchauftrag", priority: 0.78 },
  { path: "/immobilienpreise-aurich", priority: 0.9 },
  { path: "/hauspreise-aurich", priority: 0.84 },
  { path: "/wohnungspreise-aurich", priority: 0.84 },
  { path: "/grundstueckspreise-aurich", priority: 0.82 },
  { path: "/bodenrichtwert-aurich", priority: 0.8 },
  { path: "/mietspiegel-aurich", priority: 0.78 },
  { path: "/immobilienmakler-aurich", priority: 0.95 },
  { path: "/verkaufssituationen", priority: 0.82 },
  { path: "/immobilie-verkaufen-alter", priority: 0.78 },
  { path: "/immobilie-verkaufen-erbschaft", priority: 0.78 },
  { path: "/immobilie-verkaufen-diskret", priority: 0.78 },
  { path: "/immobilie-verkaufen-scheidung", priority: 0.78 },
  { path: "/immobilie-verkaufen-zeitdruck", priority: 0.78 },
  { path: "/immobilie-verkaufen-auswanderung", priority: 0.76 },
  { path: "/immobilie-verkaufen-renovierungsbedarf", priority: 0.76 },
  { path: "/immobilie-verkaufen-leerstand", priority: 0.76 },
  { path: "/immobilie-verkaufen-energieausweis", priority: 0.76 },
  { path: "/maklerhaus", priority: 0.74 },
  { path: "/partner", priority: 0.6 },
  { path: "/ueber-uns", priority: 0.68 },
  { path: "/ueber-uns/sebastian-munzig", priority: 0.7 },
  { path: "/ueber-uns/arbeitsweise", priority: 0.66 },
  { path: "/ueber-uns/netzwerk", priority: 0.62 },
  { path: "/kontakt", priority: 0.76 },
  { path: "/regionen-ostfriesland", priority: 0.84 },
  { path: "/karriere", priority: 0.55 },
  { path: "/presse", priority: 0.5 },
  { path: "/recht", priority: 0.25 },
  { path: "/recht/impressum", priority: 0.2 },
  { path: "/recht/datenschutz", priority: 0.2 },
  { path: "/recht/cookies", priority: 0.15 },
];

const DYNAMIC_ROUTES: DynamicRoute[] = [
  { pageType: "immobilienmakler", prefix: "immobilienmakler", priority: 0.82 },
  { pageType: "immobilienbewertung", prefix: "immobilienbewertung", priority: 0.8 },
  { pageType: "haus_verkaufen", prefix: "haus-verkaufen", priority: 0.8 },
  { pageType: "immobilie_verkaufen", prefix: "immobilie-verkaufen", priority: 0.76 },
  { pageType: "immobilienpreise", prefix: "immobilienpreise", priority: 0.78 },
  { pageType: "immobilien", prefix: "immobilien", priority: 0.7 },
  { pageType: "haus_kaufen", prefix: "haus-kaufen", priority: 0.68 },
];

const STRATEGIC_LOCATION_SLUGS = new Set(["aurich", "ostfriesland", "emden", "leer", "wittmund", "norden"]);
const STATIC_PATHS = new Set(STATIC_ROUTES.map((route) => route.path));

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function newestDate(...dates: Array<Date | string | null | undefined>) {
  const parsed = dates.map(parseDate).filter((date): date is Date => Boolean(date));
  if (parsed.length === 0) return null;
  return new Date(Math.max(...parsed.map((date) => date.getTime())));
}

function toNumber(value: number | string | null | undefined) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isPublicSlug(slug: string | null | undefined): slug is string {
  return Boolean(slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
}

function normalizeLocationType(value: string | null | undefined): LocationType {
  if (value === "region" || value === "landkreis" || value === "ortsteil") return value;
  return "stadt_gemeinde";
}

function runtimeMarketDataPath() {
  const candidates = [
    path.join(process.cwd(), "data", "market", "runtime", "leadgen_market_data.json"),
    path.join(process.cwd(), "..", "data", "market", "runtime", "leadgen_market_data.json"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function publicRuntimeSlug(record: RuntimeMarketRecord) {
  return record.ortsteil_slug || record.stadt_gemeinde_slug || record.landkreis_slug || record.region_slug || null;
}

function runtimeObjectType(record: RuntimeMarketRecord): "haus" | "wohnung" | null {
  const value = String(record.objektart ?? "").toLocaleLowerCase("de-DE");
  if (value.includes("haus")) return "haus";
  if (value.includes("wohnung")) return "wohnung";
  return null;
}

function marketSlugCandidates(record: {
  location_slug?: string | null;
  ortsteil_slug?: string | null;
  stadt_gemeinde_slug?: string | null;
  landkreis_slug?: string | null;
  region_slug?: string | null;
}) {
  return [
    record.location_slug,
    record.ortsteil_slug,
    record.stadt_gemeinde_slug,
    record.landkreis_slug,
    record.region_slug,
  ].filter((slug): slug is string => isPublicSlug(slug));
}

function addMarketSummary(lookup: MarketLookup, slug: string, next: MarketSummary) {
  const existing = lookup.get(slug);
  lookup.set(slug, {
    median: Boolean(existing?.median || next.median),
    daysOnMarket: Boolean(existing?.daysOnMarket || next.daysOnMarket),
    salesCount: Math.max(existing?.salesCount ?? 0, next.salesCount),
    lastModified: newestDate(existing?.lastModified, next.lastModified),
  });
}

function emptySitemapData(): SitemapSourceData {
  return {
    locations: [],
    markets: {
      haus: new Map(),
      wohnung: new Map(),
    },
    content: new Map(),
  };
}

function loadRuntimeSitemapData(): SitemapSourceData {
  try {
    const snapshot = readActiveSnapshotJson<{ records?: RuntimeMarketRecord[] }>("leadgen_market_data");
    const raw =
      snapshot ??
      (() => {
        const filePath = runtimeMarketDataPath();
        if (!filePath) return { records: [] };
        return JSON.parse(fs.readFileSync(filePath, "utf8")) as { records?: RuntimeMarketRecord[] };
      })();
    const records = Array.isArray(raw.records) ? raw.records : [];
    const data = emptySitemapData();
    const locations = new Map<string, SitemapLocation>();

    for (const record of records) {
      const slug = publicRuntimeSlug(record);
      if (!isPublicSlug(slug) || !record.landingpage_geeignet) continue;

      const salesCount = toNumber(record.verkaeufe_anzahl) ?? 0;
      const locationType = normalizeLocationType(record.datensatz_typ);
      const isStrategic = STRATEGIC_LOCATION_SLUGS.has(slug) || STRATEGIC_LOCATION_SLUGS.has(record.stadt_gemeinde_slug ?? "");
      const priority = isStrategic ? 100 : 50;
      const indexable = salesCount >= 10 || isStrategic || locationType !== "ortsteil";
      const lastModified = newestDate(record.updated_at, record.created_at, record.Erstellt_am);
      const existing = locations.get(slug);

      locations.set(slug, {
        location_slug: slug,
        location_type: locationType,
        stadt_gemeinde: record.stadt_gemeinde ?? null,
        parent_location_slug: locationType === "ortsteil" ? record.stadt_gemeinde_slug ?? null : null,
        priority: Math.max(existing?.priority ?? 0, priority),
        indexable: Boolean(existing?.indexable || indexable),
        lastModified: newestDate(existing?.lastModified, lastModified),
      });

      const objectType = runtimeObjectType(record);
      if (!objectType) continue;

      const marketSummary: MarketSummary = {
        median: Boolean(toNumber(record.median_preis_eur_m2)),
        daysOnMarket: Boolean(toNumber(record.tage_am_markt)),
        salesCount,
        lastModified,
      };

      for (const candidate of marketSlugCandidates(record)) {
        addMarketSummary(data.markets[objectType], candidate, marketSummary);
      }
    }

    data.locations = Array.from(locations.values()).filter((location) => location.indexable);
    return data;
  } catch {
    return emptySitemapData();
  }
}

async function loadDatabaseSitemapData(): Promise<SitemapSourceData | null> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const [locationRowsResult, marketRowsResult, contentRowsResult] = await Promise.all([
      sql`
        SELECT location_slug, location_type, stadt_gemeinde, parent_location_slug, priority, indexable, created_at, updated_at
        FROM seo_locations
        WHERE indexable = TRUE
          AND landingpage_geeignet = TRUE
        ORDER BY priority DESC, location_slug ASC
        LIMIT 10000
      `,
      sql`
        SELECT object_type, location_slug, ortsteil_slug, stadt_gemeinde_slug, landkreis_slug, region_slug,
               median_preis_eur_m2, tage_am_markt, verkaeufe_anzahl, created_at, updated_at
        FROM market_data
        WHERE landingpage_geeignet = TRUE
          AND median_preis_eur_m2 IS NOT NULL
      `,
      sql`
        SELECT location_slug, page_type, created_at, updated_at
        FROM seo_location_content
        WHERE COALESCE(custom_intro, custom_text_1, custom_text_2, custom_text_3, meta_title, meta_description) IS NOT NULL
      `,
    ]);
    const locationRows = locationRowsResult as DatabaseLocationRow[];
    const marketRows = marketRowsResult as DatabaseMarketRow[];
    const contentRows = contentRowsResult as DatabaseContentRow[];

    const data = emptySitemapData();
    data.locations = locationRows
      .filter((row) => row.indexable && isPublicSlug(row.location_slug))
      .map((row) => ({
        location_slug: row.location_slug!,
        location_type: normalizeLocationType(row.location_type),
        stadt_gemeinde: row.stadt_gemeinde,
        parent_location_slug: row.parent_location_slug,
        priority: toNumber(row.priority) ?? 0,
        indexable: true,
        lastModified: newestDate(row.updated_at, row.created_at),
      }));

    for (const row of marketRows) {
      const objectType = row.object_type === "haus" || row.object_type === "wohnung" ? row.object_type : null;
      if (!objectType) continue;

      const marketSummary: MarketSummary = {
        median: Boolean(toNumber(row.median_preis_eur_m2)),
        daysOnMarket: Boolean(toNumber(row.tage_am_markt)),
        salesCount: toNumber(row.verkaeufe_anzahl) ?? 0,
        lastModified: newestDate(row.updated_at, row.created_at),
      };

      for (const candidate of marketSlugCandidates(row)) {
        addMarketSummary(data.markets[objectType], candidate, marketSummary);
      }
    }

    for (const row of contentRows) {
      if (!isPublicSlug(row.location_slug) || !row.page_type) continue;
      data.content.set(`${row.location_slug}:${row.page_type}`, newestDate(row.updated_at, row.created_at));
    }

    return data.locations.length > 0 ? data : null;
  } catch {
    return null;
  }
}

async function loadSitemapSourceData() {
  if (hasActiveWebsiteSnapshot()) return loadRuntimeSitemapData();
  return (await loadDatabaseSitemapData()) ?? loadRuntimeSitemapData();
}

function locationMarket(markets: MarketLookup, location: SitemapLocation) {
  return (
    markets.get(location.location_slug) ??
    (location.location_type === "ortsteil" && location.parent_location_slug
      ? markets.get(location.parent_location_slug)
      : undefined) ??
    null
  );
}

function isStrategicLocation(location: SitemapLocation) {
  return location.priority >= 90 || STRATEGIC_LOCATION_SLUGS.has(location.location_slug);
}

function hasCustomContent(content: ContentLookup, location: SitemapLocation, pageType: PageType) {
  return content.has(`${location.location_slug}:${pageType}`);
}

function customContentLastModified(content: ContentLookup, location: SitemapLocation, pageType: PageType) {
  return content.get(`${location.location_slug}:${pageType}`) ?? null;
}

function isIndexableDynamicRoute(
  route: DynamicRoute,
  location: SitemapLocation,
  houseMarket: MarketSummary | null,
  apartmentMarket: MarketSummary | null,
  content: ContentLookup,
) {
  if (!location.indexable) return false;

  if (route.pageType === "immobilienbewertung") {
    const totalSales = (houseMarket?.salesCount ?? 0) + (apartmentMarket?.salesCount ?? 0);
    return Boolean(houseMarket?.median && (houseMarket.daysOnMarket || apartmentMarket?.daysOnMarket) && totalSales > 5);
  }

  return Boolean(
    houseMarket?.median ||
      apartmentMarket?.median ||
      hasCustomContent(content, location, route.pageType) ||
      isStrategicLocation(location),
  );
}

function dynamicPriority(route: DynamicRoute, location: SitemapLocation) {
  const locationBoost = isStrategicLocation(location) ? 0.06 : location.location_type === "stadt_gemeinde" ? 0.03 : 0;
  return Math.min(0.88, Number((route.priority + locationBoost).toFixed(2)));
}

function createEntry(routePath: string, lastModified?: Date | string | null): SitemapEntry {
  const parsedLastModified = parseDate(lastModified);
  const entry: SitemapEntry = {
    url: absoluteUrl(routePath),
  };

  if (parsedLastModified) {
    entry.lastModified = parsedLastModified;
  }

  return entry;
}

function addEntry(entries: Map<string, InternalSitemapEntry>, entry: SitemapEntry, priority: number) {
  const existing = entries.get(entry.url);
  if (!existing || priority > existing.priority) {
    entries.set(entry.url, { entry, priority });
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, InternalSitemapEntry>();

  for (const route of STATIC_ROUTES) {
    addEntry(entries, createEntry(route.path), route.priority);
  }

  const sourceData = await loadSitemapSourceData();

  for (const location of sourceData.locations) {
    if (!isPublicSlug(location.location_slug)) continue;

    const houseMarket = locationMarket(sourceData.markets.haus, location);
    const apartmentMarket = locationMarket(sourceData.markets.wohnung, location);

    for (const route of DYNAMIC_ROUTES) {
      const routePath = `/${route.prefix}-${location.location_slug}`;
      if (STATIC_PATHS.has(routePath)) continue;
      if (!isIndexableDynamicRoute(route, location, houseMarket, apartmentMarket, sourceData.content)) continue;

      addEntry(
        entries,
        createEntry(
          routePath,
          newestDate(
            location.lastModified,
            houseMarket?.lastModified,
            apartmentMarket?.lastModified,
            customContentLastModified(sourceData.content, location, route.pageType),
          ),
        ),
        dynamicPriority(route, location),
      );
    }
  }

  for (const slug of REGION_LANDING_EXAMPLES) {
    addEntry(entries, createEntry(`/regionen-ostfriesland/${slug}`), 0.58);
  }

  return Array.from(entries.values())
    .sort((a, b) => b.priority - a.priority || a.entry.url.localeCompare(b.entry.url))
    .map(({ entry }) => entry);
}
