import type { SeoLocationRow } from "@/lib/types/leadgen";

const ISLAND_LOCATION_NAMES = new Set([
  "borkum",
  "juist",
  "norderney",
  "baltrum",
  "langeoog",
  "spiekeroog",
  "wangerooge",
]);

function normalizeLocation(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("de-DE");
}

export function formatLocationLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  const uniqueParts = parts.filter((part, index) => {
    const normalizedPart = normalizeLocation(part);
    return !parts.slice(0, index).some((previous) => normalizeLocation(previous) === normalizedPart);
  });

  if (uniqueParts.length < 2) return uniqueParts[0] ?? label.trim();
  return `${uniqueParts[0]}, ${uniqueParts.slice(1).join(", ")}`;
}

export function formatLocationName(location: SeoLocationRow) {
  const label = formatLocationLabel(location.location_label.trim());
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label.split(",")[0]?.trim() || label;

  if (location.location_type === "ortsteil" && city && district && normalizeLocation(district) !== normalizeLocation(city)) {
    return `${district}, ${city}`;
  }

  return label;
}

export function formatLocationProseName(location: SeoLocationRow) {
  const label = formatLocationLabel(location.location_label.trim());
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label.split(",")[0]?.trim() || label;

  if (location.location_type === "ortsteil" && city && district && normalizeLocation(district) !== normalizeLocation(city)) {
    return `${district} in ${city}`;
  }

  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]} in ${parts.slice(1).join(", ")}`;
}

export function isIslandLocation(location: SeoLocationRow) {
  return ISLAND_LOCATION_NAMES.has(normalizeLocation(formatLocationName(location)));
}

export function isIslandLocationName(locationName: string) {
  return ISLAND_LOCATION_NAMES.has(normalizeLocation(formatLocationLabel(locationName)));
}

export function formatLocationPhrase(location: SeoLocationRow) {
  return `${isIslandLocation(location) ? "auf" : "in"} ${
    isIslandLocation(location) ? formatLocationName(location) : formatLocationProseName(location)
  }`;
}

export function formatLocationPhraseFromName(locationName: string) {
  const label = formatLocationLabel(locationName);
  return `${isIslandLocationName(label) ? "auf" : "in"} ${label}`;
}

export function formatLocationPhraseStart(location: SeoLocationRow) {
  const phrase = formatLocationPhrase(location);
  return phrase.charAt(0).toLocaleUpperCase("de-DE") + phrase.slice(1);
}
