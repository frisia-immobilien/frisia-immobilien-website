import { SITE_URL } from "@/lib/site";

export { SITE_URL };

export const CORE_REGIONS = ["Aurich", "Emden", "Leer", "Wittmund", "Norden", "Ostfriesland"] as const;

export type LandingIntent =
  | "immobilienmakler"
  | "immobilienpreise"
  | "haus-verkaufen"
  | "immobilienbewertung"
  | "immobilien";

export const INTENT_LABELS: Record<LandingIntent, string> = {
  immobilienmakler: "Immobilienmakler",
  immobilienpreise: "Immobilienpreise",
  "haus-verkaufen": "Haus verkaufen",
  immobilienbewertung: "Immobilienbewertung",
  immobilien: "Immobilien",
};

export const REGION_LANDING_EXAMPLES = [
  "immobilienmakler-aurich",
  "immobilienpreise-aurich",
  "haus-verkaufen-aurich",
  "immobilienbewertung-aurich",
  "immobilienmakler-haxtum",
  "immobilienpreise-egels",
  "immobilienmakler-emden",
  "immobilienmakler-leer",
  "immobilienmakler-wittmund",
  "immobilienmakler-norden",
] as const;

const LOCATION_LABELS: Record<string, string> = {
  grossheide: "Großheide",
  suedbrookmerland: "Südbrookmerland",
  krummhoern: "Krummhörn",
};

const INTENT_ORDER: LandingIntent[] = [
  "immobilienmakler",
  "immobilienpreise",
  "haus-verkaufen",
  "immobilienbewertung",
  "immobilien",
];

export function parseLandingSlug(slug: string): { intent: LandingIntent; location: string } | null {
  for (const intent of INTENT_ORDER) {
    const prefix = `${intent}-`;
    if (slug.startsWith(prefix)) {
      const location = slug.slice(prefix.length).trim();
      if (!location) return null;
      return { intent, location };
    }
  }
  return null;
}

export function toTitleCase(value: string): string {
  if (LOCATION_LABELS[value]) return LOCATION_LABELS[value];
  return value
    .split("-")
    .map((part) => {
      if (LOCATION_LABELS[part]) return LOCATION_LABELS[part];
      return part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part;
    })
    .join(" ");
}
