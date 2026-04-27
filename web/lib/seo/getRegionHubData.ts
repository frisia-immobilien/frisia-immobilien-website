import "server-only";

import { sql } from "@/lib/db";
import type { SeoLocationRow } from "@/lib/types/leadgen";

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

  const locations = rows.length > 0 ? rows : fallbackLocations;
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

  return {
    locations,
    grouped: Array.from(grouped.entries()).map(([landkreis, cityMap]) => ({
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
            return a.location_label.localeCompare(b.location_label, "de");
          });

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
        }),
    })),
  };
}
