import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import LeadGenWizard from "@/components/immobilienbewertung/LeadGenWizard.client";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Online-Immobilienbewertung Aurich",
  description:
    "Strukturierte Immobilienbewertung von Frisia Immobilien in Aurich für Eigentümer, die Preis, Markt und nächsten Schritt sauber einordnen wollen.",
  path: "/immobilienbewertung",
  keywords: [
    "immobilienbewertung aurich",
    "immobilie bewerten lassen aurich",
    "haus bewerten aurich",
    "wohnung bewerten aurich",
  ],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/immobilienbewertung", [
  { name: "Startseite", item: SITE_URL },
  { name: "Immobilienbewertung", item: `${SITE_URL}/immobilienbewertung` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/immobilienbewertung",
  name: "Immobilienbewertung Aurich",
  description:
    "Lead- und Bewertungsseite von Frisia Immobilien für Eigentümer in Aurich und Ostfriesland.",
});

export default function ImmobilienbewertungPage() {
  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <h1 className="sr-only">Immobilienbewertung Aurich</h1>
      <LeadGenWizard />
    </main>
  );
}
