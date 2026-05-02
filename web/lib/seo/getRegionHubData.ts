import "server-only";

import fs from "node:fs";
import path from "node:path";

import { sql } from "@/lib/db";
import type { SeoLocationRow } from "@/lib/types/leadgen";

type RuntimeMarketRecord = {
  landkreis?: string | null;
  stadt_gemeinde?: string | null;
  ortsteil?: string | null;
  datensatz_typ?: string | null;
  location_label?: string | null;
  region_code?: string | null;
  landkreis_slug?: string | null;
  stadt_gemeinde_slug?: string | null;
  ortsteil_slug?: string | null;
  region_slug?: string | null;
  plz?: string | null;
  landingpage_geeignet?: boolean | null;
  leadgen_geeignet?: boolean | null;
  verkaeufe_anzahl?: number | null;
};

const fallbackLocations: SeoLocationRow[] = [
  {
    id: "aurich",
    location_slug: "aurich",
    location_label: "Aurich",
    location_type: "stadt_gemeinde",
    stadt_gemeinde: "Aurich",
    ortsteil: null,
    landkreis: "Landkreis Aurich",
    region: "Ostfriesland",
    plz: "26603",
    lat: null,
    lng: null,
    parent_location_slug: "landkreis-aurich",
    landingpage_geeignet: true,
    leadgen_geeignet: true,
    priority: 100,
    indexable: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "emden",
    location_slug: "emden",
    location_label: "Emden",
    location_type: "stadt_gemeinde",
    stadt_gemeinde: "Emden",
    ortsteil: null,
    landkreis: "Stadt Emden",
    region: "Ostfriesland",
    plz: "26721",
    lat: null,
    lng: null,
    parent_location_slug: null,
    landingpage_geeignet: true,
    leadgen_geeignet: true,
    priority: 90,
    indexable: true,
    created_at: "",
    updated_at: "",
  },
];

const STRATEGIC_CITY_SLUGS = new Set([
  "aurich",
  "emden",
  "leer",
  "wittmund",
  "norden",
  "esens",
  "wiesmoor",
  "suedbrookmerland",
  "grossheide",
]);

const MAX_CITIES_PER_REGION_GROUP = 12;
const MAX_PLACES_PER_CITY = 6;

function runtimeMarketDataPath() {
  const candidates = [
    path.join(process.cwd(), "..", "data", "market", "runtime", "leadgen_market_data.json"),
    path.join(process.cwd(), "data", "market", "runtime", "leadgen_market_data.json"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function publicSlug(record: RuntimeMarketRecord) {
  return record.ortsteil_slug || record.stadt_gemeinde_slug || record.landkreis_slug || record.region_slug || "";
}

function locationType(record: RuntimeMarketRecord): SeoLocationRow["location_type"] {
  if (record.datensatz_typ === "ortsteil") return "ortsteil";
  if (record.datensatz_typ === "landkreis") return "landkreis";
  if (record.datensatz_typ === "region") return "region";
  return "stadt_gemeinde";
}

function parentLocationSlug(record: RuntimeMarketRecord) {
  if (record.datensatz_typ === "ortsteil") return record.stadt_gemeinde_slug ?? null;
  if (record.datensatz_typ === "stadt_gemeinde") return record.landkreis_slug ?? null;
  if (record.datensatz_typ === "landkreis") return record.region_slug ?? null;
  return null;
}

function fallbackLocationLabel(record: RuntimeMarketRecord) {
  return (
    record.location_label ||
    record.ortsteil ||
    record.stadt_gemeinde ||
    record.landkreis ||
    "Ostfriesland"
  );
}

function runtimeFallbackLocations() {
  const filePath = runtimeMarketDataPath();
  if (!filePath) return fallbackLocations;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as { records?: RuntimeMarketRecord[] };
    const records = Array.isArray(raw.records) ? raw.records : [];
    const bySlug = new Map<string, SeoLocationRow & { salesCount: number }>();

    for (const record of records) {
      const slug = publicSlug(record);
      if (!slug) continue;

      const type = locationType(record);
      if (type !== "stadt_gemeinde" && type !== "ortsteil") continue;

      const salesCount = Number(record.verkaeufe_anzahl ?? 0);
      const priority = STRATEGIC_CITY_SLUGS.has(record.stadt_gemeinde_slug ?? "") ? 100 : 50;
      const existing = bySlug.get(slug);

      const next: SeoLocationRow & { salesCount: number } = {
        id: slug,
        location_slug: slug,
        location_label: fallbackLocationLabel(record),
        location_type: type,
        stadt_gemeinde: record.stadt_gemeinde ?? null,
        ortsteil: record.ortsteil ?? null,
        landkreis: record.landkreis ?? null,
        region: "Ostfriesland",
        plz: record.plz ?? null,
        lat: null,
        lng: null,
        parent_location_slug: parentLocationSlug(record),
        landingpage_geeignet: Boolean(record.landingpage_geeignet),
        leadgen_geeignet: Boolean(record.leadgen_geeignet),
        priority,
        indexable: Boolean(record.landingpage_geeignet && (salesCount >= 10 || priority >= 90 || type !== "ortsteil")),
        created_at: "",
        updated_at: "",
        salesCount,
      };

      if (!existing) {
        bySlug.set(slug, next);
        continue;
      }

      bySlug.set(slug, {
        ...existing,
        landingpage_geeignet: existing.landingpage_geeignet || next.landingpage_geeignet,
        leadgen_geeignet: existing.leadgen_geeignet || next.leadgen_geeignet,
        indexable: existing.indexable || next.indexable,
        priority: Math.max(existing.priority, next.priority),
        salesCount: Math.max(existing.salesCount, next.salesCount),
      });
    }

    const locations = Array.from(bySlug.values())
      .sort((a, b) => {
        const landkreis = (a.landkreis ?? "").localeCompare(b.landkreis ?? "", "de");
        if (landkreis !== 0) return landkreis;
        const city = (a.stadt_gemeinde ?? "").localeCompare(b.stadt_gemeinde ?? "", "de");
        if (city !== 0) return city;
        if (a.location_type !== b.location_type) return a.location_type === "stadt_gemeinde" ? -1 : 1;
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.location_label.localeCompare(b.location_label, "de");
      })
      .map((location) => {
        const seoLocation = { ...location };
        delete (seoLocation as Partial<typeof seoLocation>).salesCount;
        return seoLocation as SeoLocationRow;
      });

    return locations.length > fallbackLocations.length ? locations : fallbackLocations;
  } catch {
    return fallbackLocations;
  }
}

function normalizeCityKey(value: string | null | undefined) {
  const label = String(value ?? "").trim();
  const normalized = label.toLowerCase();

  if (normalized === "aurich" || normalized === "aurich (ostfriesland)" || normalized === "aurich ostfriesland") {
    return "aurich";
  }

  return normalized || label;
}

function preferredCityLabel(cityKey: string, fallback: string) {
  if (cityKey === "aurich") return "Aurich (Ostfriesland)";
  return fallback;
}

function cityLocationScore(location: SeoLocationRow) {
  let score = location.priority ?? 0;
  if (location.indexable) score += 1000;
  if (location.location_label === "Aurich (Ostfriesland)") score += 5000;
  if (location.location_slug === "aurich-ostfriesland") score += 3000;
  if (location.location_label === "Aurich") score += 1000;
  return score;
}

function chooseCityLocation(current: SeoLocationRow | null, next: SeoLocationRow) {
  if (!current) return next;
  return cityLocationScore(next) > cityLocationScore(current) ? next : current;
}

export async function getRegionHubData() {
  let rows: SeoLocationRow[] = [];
  try {
    rows = (await sql`
      SELECT *
      FROM seo_locations
      WHERE landingpage_geeignet = TRUE OR indexable = TRUE
      ORDER BY landkreis ASC NULLS LAST, stadt_gemeinde ASC NULLS LAST, location_type ASC, priority DESC, location_label ASC
      LIMIT 1200
    `) as SeoLocationRow[];
  } catch {
    rows = [];
  }

  const locations = rows.length >= 10 ? rows : runtimeFallbackLocations();
  const grouped = new Map<
    string,
    Map<string, { cityLabel: string; cityLocation: SeoLocationRow | null; places: SeoLocationRow[] }>
  >();

  for (const location of locations) {
    if (location.location_type !== "stadt_gemeinde" && location.location_type !== "ortsteil") {
      continue;
    }

    const landkreis = location.landkreis || "Ostfriesland";
    const rawCity = location.stadt_gemeinde || location.location_label;
    const cityKey = normalizeCityKey(rawCity);
    const cityLabel = preferredCityLabel(cityKey, rawCity);
    if (!grouped.has(landkreis)) grouped.set(landkreis, new Map());
    const cityMap = grouped.get(landkreis)!;
    if (!cityMap.has(cityKey)) cityMap.set(cityKey, { cityLabel, cityLocation: null, places: [] });
    const cityGroup = cityMap.get(cityKey)!;

    if (location.location_type === "stadt_gemeinde") {
      cityGroup.cityLocation = chooseCityLocation(cityGroup.cityLocation, location);
    } else if (location.location_type === "ortsteil") {
      cityGroup.places.push(location);
    }
  }

  const groupedResult = Array.from(grouped.entries()).map(([landkreis, cityMap]) => ({
    landkreis,
    cities: Array.from(cityMap.entries())
      .map(([cityKey, group]) => {
          const city = preferredCityLabel(cityKey, group.cityLabel);
          const cityLocation =
            group.cityLocation ??
            group.places.find((place) => normalizeCityKey(place.stadt_gemeinde) === cityKey) ??
            null;
          const places = [...group.places].sort((a, b) => {
            if (a.indexable !== b.indexable) return a.indexable ? -1 : 1;
            if (a.priority !== b.priority) return b.priority - a.priority;
            return a.location_label.localeCompare(b.location_label, "de");
          }).slice(0, MAX_PLACES_PER_CITY);

          return {
            city,
            cityLocation,
            places,
            totalLocations: places.length + (cityLocation ? 1 : 0),
            indexableLocations: places.filter((place) => place.indexable).length + (cityLocation?.indexable ? 1 : 0),
          };
        })
        .sort((a, b) => {
          const priorityA = a.cityLocation?.priority ?? Math.max(...a.places.map((place) => place.priority), 0);
          const priorityB = b.cityLocation?.priority ?? Math.max(...b.places.map((place) => place.priority), 0);
          if (priorityA !== priorityB) return priorityB - priorityA;
          return a.city.localeCompare(b.city, "de");
        })
        .slice(0, MAX_CITIES_PER_REGION_GROUP),
  }));

  const visibleLocations = groupedResult.flatMap((group) =>
    group.cities.flatMap((city) => [
      ...(city.cityLocation ? [city.cityLocation] : []),
      ...city.places,
    ]),
  );

  return {
    locations: visibleLocations,
    grouped: groupedResult,
  };
}
