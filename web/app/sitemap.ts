import type { MetadataRoute } from "next";
import { REGION_LANDING_EXAMPLES } from "@/lib/regions";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const STATIC_ROUTES = [
  "/",
  "/immobilienbewertung",
  "/immobilie-bewerten",
  "/immobilienpreise",
  "/haus-verkaufen",
  "/haus-kaufen",
  "/immobilienbewertung-aurich",
  "/haus-verkaufen-aurich",
  "/immobilien-verkaufen-aurich",
  "/haus-kaufen-aurich",
  "/immobilien-aurich",
  "/immobilienpreise-aurich",
  "/hauspreise-aurich",
  "/wohnungspreise-aurich",
  "/grundstueckspreise-aurich",
  "/bodenrichtwert-aurich",
  "/mietspiegel-aurich",
  "/immobilienmakler-aurich",
  "/verkaufssituationen",
  "/immobilie-verkaufen-alter",
  "/immobilie-verkaufen-erbschaft",
  "/immobilie-verkaufen-diskret",
  "/immobilie-verkaufen-scheidung",
  "/immobilie-verkaufen-zeitdruck",
  "/immobilie-verkaufen-auswanderung",
  "/immobilie-verkaufen-renovierungsbedarf",
  "/immobilie-verkaufen-leerstand",
  "/immobilie-verkaufen-energieausweis",
  "/maklerhaus",
  "/ueber-uns",
  "/ueber-uns/sebastian-munzig",
  "/ueber-uns/arbeitsweise",
  "/ueber-uns/netzwerk",
  "/kontakt",
  "/regionen-ostfriesland",
  "/karriere",
  "/presse",
  "/recht",
  "/recht/impressum",
  "/recht/datenschutz",
  "/recht/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority:
      route === "/"
        ? 1
        : route === "/immobilienmakler-aurich"
          ? 0.95
          : route === "/immobilienbewertung"
            ? 0.9
            : 0.8,
  }));

  const regionEntries: MetadataRoute.Sitemap = REGION_LANDING_EXAMPLES.map((slug) => ({
    url: `${SITE_URL}/regionen-ostfriesland/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...regionEntries];
}
