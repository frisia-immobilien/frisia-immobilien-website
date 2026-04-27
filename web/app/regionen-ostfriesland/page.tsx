import type { Metadata } from "next";

import JsonLd from "@/components/seo/JsonLd";
import RegionHub from "@/components/seo/RegionHub";
import { buildPageMetadata } from "@/lib/metadata";
import { getRegionHubData } from "@/lib/seo/getRegionHubData";
import { buildRegionHubSchemas } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilienpreise und Immobilienmakler Ostfriesland",
  description:
    "Regionale Orientierung für Immobilienpreise, Immobilienbewertung und Immobilienverkauf in Ostfriesland: Aurich, Emden, Leer, Wittmund, Wilhelmshaven und Friesland.",
  path: "/regionen-ostfriesland",
  keywords: [
    "immobilienpreise ostfriesland",
    "immobilienmakler ostfriesland",
    "immobilienbewertung ostfriesland",
    "haus verkaufen ostfriesland",
    "immobilie verkaufen ostfriesland",
    "immobilienmarkt ostfriesland",
    "frisia immobilien ostfriesland",
  ],
});

export default async function RegionenOstfrieslandPage() {
  const data = await getRegionHubData();
  const schemaItems = data.locations
    .filter((location) => location.indexable)
    .slice(0, 100)
    .map((location) => ({
      name: location.location_label,
      url: `${SITE_URL}/immobilienpreise-${location.location_slug}`,
      locationType: location.location_type,
      landkreis: location.landkreis,
      lat: location.lat,
      lng: location.lng,
    }));
  const schemas = buildRegionHubSchemas(schemaItems);

  return (
    <main id="main-content" className="bg-white">
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          Regionen Ostfriesland
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.12] text-[color:var(--color-navy)] md:text-5xl">
          Immobilienpreise und Immobilienmakler in Ostfriesland
        </h1>
        <p className="mt-6 max-w-4xl text-lg leading-[1.7] text-[color:var(--color-graphite)]">
          Der Immobilienmarkt in Ostfriesland ist vielfältig und entwickelt sich je nach Lage sehr unterschiedlich.
          Während Städte wie Emden oder Aurich eigene Dynamiken zeigen, unterscheiden sich Preise und Nachfrage in den
          umliegenden Gemeinden teils deutlich.
          <br />
          <br />
          Für Eigentümer bedeutet das: Eine realistische Einschätzung ist nur mit regionalem Bezug möglich. Genau hier
          setzt Frisia Immobilien an – mit fundierter Bewertung, klarer Einordnung und einem strukturierten
          Verkaufsansatz.
          <br />
          <br />
          Wähle unten einfach den Ort, der für dich relevant ist, und erhalte eine passende Orientierung für deine
          Entscheidung.
        </p>
      </section>
      <RegionHub data={data} />
    </main>
  );
}
